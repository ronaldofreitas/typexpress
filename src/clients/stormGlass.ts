import { InternalError } from '../util/errors/internal-error';
//import { AxiosStatic } from "axios";
import config, { IConfig } from 'config';
import * as HTTPUtil from '../util/request';// * as = namespace

export interface StormGlassPointsSource {
    [key: string]: number;
}

export interface StormGlassPoint {
    readonly swellDirection: StormGlassPointsSource;
    readonly swellHeight: StormGlassPointsSource;
    readonly swellPeriod: StormGlassPointsSource;
    readonly time: string;
    readonly waveDirection: StormGlassPointsSource;
    readonly waveHeight: StormGlassPointsSource;
    readonly windDirection: StormGlassPointsSource;
    readonly windSpeed: StormGlassPointsSource;
}

export interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
}

export interface ForecastPoints {
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    time: string;
    waveDirection: number;
    waveHeight: number;
    windDirection: number;
    windSpeed: number;
}

export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const InternalMessage = 'Unexpected error when trying to comunicate to StormGlass';
        super(`${InternalMessage} : ${message}`);
    }
}

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const InternalMessage = 'Unexpected error returned by the StormGlass service';
        super(`${InternalMessage} : ${message}`);
    }
}

const stormglassResourceConfig: IConfig = config.get('App.resources.StormGlass');

export class StormGlass {

    readonly stormGlassAPIParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource = 'noaa';

    constructor(protected request = new HTTPUtil.Request()) {}

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoints[]> {
        //const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(1);
        const endTimestamp = "123456";
        try {
            const response = await this.request.get<StormGlassForecastResponse>(
                `${stormglassResourceConfig.get(
                    'apiUrl'
                )}/weather/point?lat=${lat}&lng=${lng}&params=${
                    this.stormGlassAPIParams
                }&source=${this.stormGlassAPISource}&end=${endTimestamp}`,
                {
                    headers: {
                        Authorization: stormglassResourceConfig.get('apiToken'),
                    },
                }
            );
            return this.normalizeResponse(response.data);
        } catch (error) {
            if (HTTPUtil.Request.isRequestError(error)) {
                throw new StormGlassResponseError(`Error: ${JSON.stringify(error.response.data)} Code: ${error.response.status}`);
            }
            throw new ClientRequestError(error.message);
        }
    }

    private normalizeResponse(points: StormGlassForecastResponse): ForecastPoints[] {
        return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
            swellDirection: point.swellDirection[this.stormGlassAPISource],
            swellHeight: point.swellHeight[this.stormGlassAPISource],
            swellPeriod: point.swellPeriod[this.stormGlassAPISource],
            time: point.time,
            waveDirection: point.waveDirection[this.stormGlassAPISource],
            waveHeight: point.waveHeight[this.stormGlassAPISource],
            windDirection: point.windDirection[this.stormGlassAPISource],
            windSpeed: point.windSpeed[this.stormGlassAPISource],
        }));
    }

    private isValidPoint(point: Partial<StormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }
}