import { IsInt, Max, Min } from 'class-validator';

export class AmountDto {
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  amountCents!: number;
}
