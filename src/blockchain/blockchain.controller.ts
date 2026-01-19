import { Controller, Get, Post, Body } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";
import { GetEventsDto } from "./dto/get-events.dto";

@Controller("blockchain")
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get("value")
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  // POST /blockchain/events
  @Post("events")
  async getEvents(@Body() body: GetEventsDto) {
    return this.blockchainService.getValueUpdatedEvents(
      BigInt(body.fromBlock),
      body.toBlock ? BigInt(body.toBlock) : "latest"
    );
  }
}