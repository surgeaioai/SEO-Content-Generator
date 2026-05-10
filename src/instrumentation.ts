import { logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.KAFKA_BROKERS?.trim()) {
    const { startDefaultKafkaWorkers } = await import("@/lib/kafka");
    startDefaultKafkaWorkers().catch((err: unknown) => {
      logger.error({ err }, "Kafka workers failed to start");
    });
  }
}
