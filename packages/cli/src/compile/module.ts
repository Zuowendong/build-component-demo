import fse from 'fs-extra'
import { build } from 'vite'
import { resolve } from 'path'

const { copy, ensureFileSync, readdir, removeSync } = fse