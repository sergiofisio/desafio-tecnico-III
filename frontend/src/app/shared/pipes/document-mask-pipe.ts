import { Pipe, PipeTransform } from '@angular/core';
import { Document } from '../../patients/models/patient.model';

@Pipe({
  name: 'documentMask',
  standalone: true,
})
export class DocumentMaskPipe implements PipeTransform {
  transform(value: Document['type']): string {
    console.log({ value });

    switch (value) {
      case 'CPF':
        return '000.000.000-00';
      case 'RG':
        return '00.000.000-A';
      default:
        return '';
    }
  }
}
