import { applyDecorators } from "@nestjs/common";
import { ApiConflictResponse as OldApiConflictResponse } from "@nestjs/swagger";
import { ConflictExceptionDto } from "./dto/conflict-exception.dto";

export const ApiConflictResponse = () =>
  applyDecorators(
    OldApiConflictResponse({
      description: "User already exists",
      type: ConflictExceptionDto,
    })
  );
