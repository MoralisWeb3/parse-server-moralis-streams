interface streamConfig {
    tableName: string;
    tag: string;
}
interface StreamOptions {
    apiKey: string;
    streamConfig: streamConfig[];
}
declare const moralisStreams: (parse: any, express: any, options: StreamOptions) => Promise<void>;
export default moralisStreams;
