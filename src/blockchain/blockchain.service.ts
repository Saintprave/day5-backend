import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http, decodeEventLog } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http('https://api.avax-test.network/ext/bc/C/rpc', {
        timeout: 60_000,
        retryCount: 3,
        retryDelay: 1000,
      }),
    });

    this.contractAddress = '0x94d5Dc886abcE304d87C5A35c44d1d4FbBAa2527' as `0x${string}`;
  }

  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: 'getValue',
      });

      return {
        value: value.toString(),
      };
    } catch (error: any) {
      console.error('RPC Error:', error);
      this.handleRpcError(error);
    }
  }

  async getValueUpdatedEvents(
    fromBlock: bigint,
    toBlock: bigint | 'latest' = 'latest'
  ) {
    try {
      const logs = await this.client.getLogs({
        address: this.contractAddress,
        fromBlock,
        toBlock,
      });

      console.log('Total logs found:', logs.length);

      const valueUpdatedEvents = logs
        .map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: SIMPLE_STORAGE.abi,
              data: log.data,
              topics: log.topics,
            });

            console.log('Decoded event:', decoded);

            if (decoded.eventName === 'ValueUpdated') {
              return {
                blockNumber: log.blockNumber?.toString(),
                value: (decoded.args as any).newValue?.toString() || 'N/A',
                txHash: log.transactionHash,
              };
            }
          } catch (error) {
            console.log('Failed to decode log:', error);
          }
          return null;
        })
        .filter((event) => event !== null);

      return valueUpdatedEvents;
    } catch (error: any) {
      console.error('RPC Error:', error);
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Please try again in a few moments.'
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed') ||
      message.includes('econnrefused')
    ) {
      throw new ServiceUnavailableException(
        'Unable to connect to blockchain RPC.'
      );
    }

    if (message.includes('execution reverted')) {
      throw new InternalServerErrorException(
        'Smart contract execution failed.'
      );
    }

    if (message.includes('invalid') && message.includes('block')) {
      throw new InternalServerErrorException(
        'Invalid block range specified.'
      );
    }

    throw new InternalServerErrorException(
      'An error occurred while reading blockchain data.'
    );
  }
}
