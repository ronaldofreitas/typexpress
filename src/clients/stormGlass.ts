import { AxiosStatic } from "axios";

export interface StormGlassPointsSource {
    [key: string]: number;
}

export interface StormGlassPoints {
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
    hours: StormGlassPoints[];
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

export class StormGlass {
    
    readonly stormGlassAPIParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource = 'noaa';

    constructor(protected request: AxiosStatic) {}

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoints[]> {
        const response = await this.request.get<StormGlassForecastResponse>(`
            https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${lng}
        `);
        return this.normalizeResponse(response.data);
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