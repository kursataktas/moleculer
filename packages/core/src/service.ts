import _ from "lodash";
import type { ServiceBroker } from "./broker";
import { ServiceSchemaError } from "./errors";
import type { ServiceSchema } from "./serviceSchema";
import { isFunction } from "./utils";

export type ServiceVersion = string | number | null;

export class Service {
	public name: string;
	public version: ServiceVersion;
	public fullName: string;

	public schema!: ServiceSchema;

	public metadata: Record<string, unknown> = {};
	public settings: Record<string, unknown> = {};

	protected broker!: ServiceBroker;
	protected logger!: Console;

	public constructor(name: string, version?: ServiceVersion) {
		this.name = name;
		this.version = version ?? null;
		this.fullName = Service.getVersionedFullName(name, version);

		this.schema = {
			name,
			version,
		};
	}

	public static getVersionedFullName(name: string, version?: ServiceVersion): string {
		if (version != null) {
			if (typeof version === "number") {
				return `v${version}.${name}`;
			}
			return `${version}.${name}`;
		}
		return name;
	}

	public static createFromSchema(schema: ServiceSchema): Service {
		if (!schema.name)
			throw new ServiceSchemaError(
				"Service name can't be empty! Is it not a service schema?",
				schema,
			);
		const svc = new Service(schema.name, schema.version);
		svc.schema = schema;

		if (schema.metadata) svc.metadata = _.cloneDeep(schema.metadata);
		if (schema.settings) svc.settings = _.cloneDeep(schema.settings);

		return svc;
	}

	public async init(broker: ServiceBroker): Promise<void> {
		this.broker = broker;
		this.logger = broker.logger;

		if (this.schema.created) {
			if (isFunction(this.schema.created)) {
				await this.schema.created.call(this);
			}
		}
	}

	public async start(): Promise<void> {
		if (this.schema.started) {
			if (isFunction(this.schema.started)) {
				await this.schema.started.call(this);
			}
		}
	}

	public async stop(): Promise<void> {
		if (this.schema.stopped) {
			if (isFunction(this.schema.stopped)) {
				await this.schema.stopped.call(this);
			}
		}
	}
}
