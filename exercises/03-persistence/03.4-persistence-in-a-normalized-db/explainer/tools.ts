import type {
  InferToolInput,
  InferToolOutput,
  UIMessage,
  UIMessageStreamWriter,
} from 'ai';
import type { MyDataPart } from './types.ts';
import { tool } from 'ai';
import { z } from 'zod';

export const getWeatherInformation = (
  // need to type like this to avoid circular type dependencies
  // typing here is not necessary, but provides type safety for `writer.write()`
  // e.g. completion for `data-weather` and type safe `data` object
  writer: UIMessageStreamWriter<UIMessage<never, MyDataPart>>,
) =>
  tool({
    description: 'show the weather in a given city to the user',
    inputSchema: z.object({ city: z.string() }),
    execute: async ({ city }, { toolCallId: id }) => {
      // write initial message part
      writer.write({
        type: 'data-weather',
        data: {
          location: city,
          weather: undefined,
          loading: true,
        },
        id,
      });

      // Add artificial delay of 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const weatherOptions = [
        'sunny',
        'cloudy',
        'rainy',
        'snowy',
        'windy',
      ];

      const weather =
        weatherOptions[
          Math.floor(Math.random() * weatherOptions.length)
        ];

      // add weather value with same id
      writer.write({
        type: 'data-weather',
        data: { weather, loading: true },
        id,
      });

      // add another artificial delay of 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate random temperature between -10 and 40 degrees Celsius
      const temperature = Math.floor(Math.random() * 51) - 10;

      // write temperature value with same id
      writer.write({
        type: 'data-weather',
        data: { temperature, loading: false },
        id,
      });

      return { city, weather };
    },
  });

// types used in our db schema
export type getWeatherInformationInput = InferToolInput<
  ReturnType<typeof getWeatherInformation>
>;
export type getWeatherInformationOutput = InferToolOutput<
  ReturnType<typeof getWeatherInformation>
>;

export const getLocation = tool({
  description: 'Get the user location.',
  inputSchema: z.object({}),
  // client side tool requires typing the output schema explicitly
  outputSchema: z.object({ location: z.string() }),
});

export type getLocationInput = InferToolInput<
  typeof getLocation
>;
export type getLocationOutput = InferToolOutput<
  typeof getLocation
>;

export const tools = (writer: UIMessageStreamWriter) => ({
  getWeatherInformation: getWeatherInformation(writer), // pipe in stream writer
  getLocation,
});
