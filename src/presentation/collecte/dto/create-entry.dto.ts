export class CreateEntryDto {
  items: {
    productRef: string;
    weightKg: number;
  }[];
}
