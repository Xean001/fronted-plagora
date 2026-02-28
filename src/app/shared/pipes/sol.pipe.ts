import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sol', standalone: true })
export class SolPipe implements PipeTransform {
    transform(value: number | null | undefined, decimals = 2): string {
        if (value == null) return 'S/ 0.00';
        return 'S/ ' + value.toLocaleString('es-PE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
}
