import type { MyUIMessagePart } from './types.ts';
import type {
  MyDBUIMessagePart,
  MyDBUIMessagePartSelect,
} from './schema.ts';

export const mapUIMessagePartsToDBParts = (
  messageParts: MyUIMessagePart[],
  messageId: string,
): MyDBUIMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case 'text':
        return {
          messageId,
          order: index,
          type: part.type,
          text_text: part.text,
        };
      case 'reasoning':
        return {
          messageId,
          order: index,
          type: part.type,
          reasoning_text: part.text,
          providerMetadata: part.providerMetadata,
        };
      case 'file':
        return {
          messageId,
          order: index,
          type: part.type,
          file_mediaType: part.mediaType,
          file_filename: part.filename,
          file_url: part.url,
        };
      case 'source-document':
        return {
          messageId,
          order: index,
          type: part.type,
          source_document_sourceId: part.sourceId,
          source_document_mediaType: part.mediaType,
          source_document_title: part.title,
          source_document_filename: part.filename,
          providerMetadata: part.providerMetadata,
        };
      case 'source-url':
        return {
          messageId,
          order: index,
          type: part.type,
          source_url_sourceId: part.sourceId,
          source_url_url: part.url,
          source_url_title: part.title,
          providerMetadata: part.providerMetadata,
        };
      case 'step-start':
        return {
          messageId,
          order: index,
          type: part.type,
        };
      case 'tool-getWeatherInformation':
        return {
          messageId,
          order: index,
          type: part.type,
          tool_toolCallId: part.toolCallId,
          tool_state: part.state,
          tool_getWeatherInformation_input:
            part.state === 'input-available' ||
            part.state === 'output-available' ||
            part.state === 'output-error'
              ? part.input
              : undefined,
          tool_getWeatherInformation_output:
            part.state === 'output-available'
              ? part.output
              : undefined,
          tool_getWeatherInformation_errorText:
            part.state === 'output-error'
              ? part.errorText
              : undefined,
        };
      case 'tool-getLocation':
        return {
          messageId,
          order: index,
          type: part.type,
          tool_toolCallId: part.toolCallId,
          tool_state: part.state,
          tool_getLocation_input:
            part.state === 'input-available' ||
            part.state === 'output-available' ||
            part.state === 'output-error'
              ? part.input
              : undefined,
          tool_getLocation_output:
            part.state === 'output-available'
              ? part.output
              : undefined,
          tool_getLocation_errorText:
            part.state === 'output-error'
              ? part.errorText
              : undefined,
        };
      case 'data-weather':
        return {
          messageId,
          order: index,
          type: part.type,
          data_weather_id: part.id,
          data_weather_location: part.data.location,
          data_weather_weather: part.data.weather,
          data_weather_temperature: part.data.temperature,
          // no need to persist loading variable -> set to false in mapping below
        };
      default:
        throw new Error(`Unsupported part type: ${part}`);
    }
  });
};

export const mapDBPartToUIMessagePart = (
  part: MyDBUIMessagePartSelect,
): MyUIMessagePart => {
  switch (part.type) {
    case 'text':
      return {
        type: part.type,
        text: part.text_text!,
      };
    case 'reasoning':
      return {
        type: part.type,
        text: part.reasoning_text!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'file':
      return {
        type: part.type,
        mediaType: part.file_mediaType!,
        filename: part.file_filename!,
        url: part.file_url!,
      };
    case 'source-document':
      return {
        type: part.type,
        sourceId: part.source_document_sourceId!,
        mediaType: part.source_document_mediaType!,
        title: part.source_document_title!,
        filename: part.source_document_filename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'source-url':
      return {
        type: part.type,
        sourceId: part.source_url_sourceId!,
        url: part.source_url_url!,
        title: part.source_url_title!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'step-start':
      return {
        type: part.type,
      };
    case 'tool-getWeatherInformation':
      if (!part.tool_state) {
        throw new Error(
          'getWeatherInformation_state is undefined',
        );
      }
      switch (part.tool_state) {
        case 'input-streaming':
          return {
            type: 'tool-getWeatherInformation',
            state: 'input-streaming',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWeatherInformation_input!,
          };
        case 'input-available':
          return {
            type: 'tool-getWeatherInformation',
            state: 'input-available',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWeatherInformation_input!,
          };
        case 'output-available':
          return {
            type: 'tool-getWeatherInformation',
            state: 'output-available',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWeatherInformation_input!,
            output: part.tool_getWeatherInformation_output!,
          };
        case 'output-error':
          return {
            type: 'tool-getWeatherInformation',
            state: 'output-error',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWeatherInformation_input!,
            errorText: part.tool_errorText!,
          };
      }
    case 'tool-getLocation':
      if (!part.tool_state) {
        throw new Error(
          'getWeatherInformation_state is undefined',
        );
      }
      switch (part.tool_state) {
        case 'input-streaming':
          return {
            type: 'tool-getLocation',
            state: 'input-streaming',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getLocation_input!,
          };
        case 'input-available':
          return {
            type: 'tool-getLocation',
            state: 'input-available',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getLocation_input!,
          };
        case 'output-available':
          return {
            type: 'tool-getLocation',
            state: 'output-available',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getLocation_input!,
            output: part.tool_getLocation_output!,
          };
        case 'output-error':
          return {
            type: 'tool-getLocation',
            state: 'output-error',
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getLocation_input!,
            errorText: part.tool_errorText!,
          };
      }
    case 'data-weather':
      return {
        type: 'data-weather',
        data: {
          loading: false,
          location: part.data_weather_location!,
          weather: part.data_weather_weather!,
          temperature: part.data_weather_temperature!,
        },
        id: part.data_weather_id!,
      };
    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};
