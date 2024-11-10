import { ServiceBroker } from "../../src";
import type { Context } from "../../src/context";
import { Service } from "../../src/service";
import { Action, MoleculerService } from "../../src/serviceDecorators";

@MoleculerService({
	name: "decorator-service",
	metadata: {
		region: "us-east",
		zone: "a",
		cluster: true,
	},
	settings: {
		a: 5,
		b: "Test",
	},
})
class MyNativeService extends Service {
	private localVar?: number;

	@Action({
		params: {
			name: "string",
		},
	})
	public async hello(ctx: Context<{ name: string }>): Promise<string> {
		return Promise.resolve(`Hello ${this.uppercase(ctx.params.name)}!`);
	}

	public override async init(broker: ServiceBroker): Promise<void> {
		await super.init(broker);

		this.localVar = 123;

		const region = this.uppercase(this.metadata.region);
		this.logger.info(
			`${this.fullName} service initialized. settings.a: ${this.settings.a}, metadata.region: ${region}, localVar: ${this.localVar}`,
		);
		// this.schema.settings.a;

		return Promise.resolve();
	}

	public override async start(): Promise<void> {
		await super.start();

		this.logger.info(`${this.fullName} service started.`);

		return Promise.resolve();
	}

	public override async stop(): Promise<void> {
		await super.stop();

		this.logger.info(`${this.fullName} service stopped.`);
		return Promise.resolve();
	}

	private uppercase(str: string): string {
		return str.toUpperCase();
	}
}

async function start() {
	// --- CREATE BROKER ---
	const broker = new ServiceBroker();

	// --- CREATE CLASS SERVICE ---
	const myNativeService = new MyNativeService();
	await broker.loadService(myNativeService);

	// --- START BROKER ---
	await broker.start();

	// --- TESTING ---

	// --- STOP BROKER ---
	await broker.stop();
}

start().catch(console.error);
