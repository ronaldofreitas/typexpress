//import { StormGlass } from '@src/clients/stromGlass';
//import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';

import { StormGlass } from '../stormGlass';
import * as stormglassWeatherPointFixture from '../../../test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponseFixture from '../../../test/fixtures/stormglass_normalized_response_3_hours.json';

import axios from 'axios';
jest.mock('axios');

describe('StormGlass client', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    it('should return the normalized forecast from the stormglass service', async () => {
        const lat = -33.123;
        const lng = 151.287;

        mockedAxios.get.mockResolvedValue({data: stormglassWeatherPointFixture});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormglassNormalizedResponseFixture);
    });
});