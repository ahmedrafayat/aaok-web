import { Field } from '../models/Field';
import { FieldType } from '../enums/FieldType';
import { CheckValue, GenericValue, LocationValue } from '../models/Answer';

export = {
  generateValueType(
    field: Field,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any
  ): LocationValue | GenericValue | CheckValue {
    switch (field.fieldType) {
      case FieldType.LOCATION:
        return {
          type: field.fieldType,
          latitude: fieldValue.latitude,
          longitude: fieldValue.longitude,
        };
      default:
        return {
          type: field.fieldType,
          value: fieldValue,
        };
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isAnonymousResponse(responseBody: any): boolean {
    return 'isAnonymous' in responseBody && responseBody.isAnonymous;
  },
};
