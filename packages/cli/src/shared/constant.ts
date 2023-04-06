import { resolve } from 'path'

export const CWD = process.cwd()

export const ES_DIR = resolve(CWD, 'es')
export const UMD_DIR = resolve(CWD, 'umd')