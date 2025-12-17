import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MetaService {
  private readonly version: string;

  constructor() {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    this.version = pkg.version;
    }

  getVersion() {
    return this.version;
  }
}
