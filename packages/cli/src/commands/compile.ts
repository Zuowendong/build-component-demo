import fse from 'fs-extra'
import { createSpinner } from 'nanospinner'
import { ES_DIR, UMD_DIR } from '../shared/constant.js'

const { remove } = fse

export function removeDir() {
  return Promise.all([remove(ES_DIR), remove(UMD_DIR)])
}

export async function runTask(taskName: string, task: () => any) {
  const s = createSpinner().start({ text: `Compiling ${taskName}` })
  try {
    await task()
    s.success({ text: `Compilation ${taskName} completed!` })
  } catch (e: any) {
    s.error({ text: `Compilation ${taskName} failed!` })
  }
}

export async function compile() {

  await removeDir()
  // await runTask('module', compileModule)
  // await runTask('bundle', compileBundle)
}
