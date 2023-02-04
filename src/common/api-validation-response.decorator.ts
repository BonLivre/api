import { applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse } from "@nestjs/swagger";
import { ValidationExceptionDto } from "./dto/validation-exception.dto";

export const ApiValidationResponse = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: "Validation failed",
      type: ValidationExceptionDto,
    })
  );
