#!/usr/bin/env node

const fs = require('fs')
const { resolve } = require('path')
const { execSync } = require('child_process')
const { program } = require('commander')
const colors = require('colors')
const logo = require('./logo')

const moreDetails = 'Supported parse-server versions are 5.2.4 - 5.4.0'

program.command('check')
.description('Checks that necessary patches can be applied')
.action(() => {
    prepareCheck()
})

program.command('prepare')
.description('Executes patches necessary to run moralis-sync webhooks')
.action(() => {
    prepareParse()
})

program.command('eject')
.description('Undos the patches applied in the prepare script')
.action(() => {
    prepareEject()
})

program.addHelpText('beforeAll', logo)
program.parse()

function prepareCheck () {
    try {
        const pkg = loadPackageJson()
        verifyPkg(pkg)
        checkIfAlreadyPrepared()

        // VERIFY PATCHES ARE VALID
        applyPatch('patches/initialize.patch', '--check --verbose')
        applyPatch('patches/number-decimal.patch', '--check --verbose')
        applyPatch('patches/bulk-operations.patch', '--check --verbose')

        printLogo()
        printSuccess('Server valid. Execute prepare command to apply patches.')
    } catch (err) {
        printLogo()
        printError(err)
    }

}

function prepareParse () {
    try {
        const pkg = loadPackageJson()
        verifyPkg(pkg)
        checkIfAlreadyPrepared()

        // EXECUTE PATCHES
        applyPatch('patches/initialize.patch')
        applyPatch('patches/number-decimal.patch')
        applyPatch('patches/bulk-operations.patch')

        printLogo()
        printSuccess('Server is prepared for moralis-sync webhook')
    } catch (err) {
        printLogo()
        printError(err)
    }
}

function prepareEject () {
    try {
        const pkg = loadPackageJson()
        verifyPkg(pkg)

        // VERIFY PATCHES ARE VALID
        applyPatch('patches/initialize.patch', '--reverse')
        applyPatch('patches/number-decimal.patch', '--reverse')
        applyPatch('patches/bulk-operations.patch', '--reverse')

        printLogo()
        printSuccess('Server ejected moralis-sync webhook')
    } catch (err) {
        printLogo()
        printError(err)
    }
}

function loadPackageJson () {
    const path = resolve(process.cwd(), 'package.json')
    let content = ''
    try {
        content = fs.readFileSync(path)
    } catch (err) {
        throw new Error(`package.json not found\n\n${moreDetails}`)
    }
    try {
        return JSON.parse(content)
    } catch (err) {
        throw new Error(`package.json is not valid json\n\n${moreDetails}`)
    }
}

function verifyPkg (pkg) {
    if (!pkg.version) {
        throw new Error(`package.json does not contain a version\n\n${moreDetails}`)
    }
}

function checkIfAlreadyPrepared () {
    const path = resolve(process.cwd(), 'src/ParseServer.js')
    let content = ''
    try {
        content = fs.readFileSync(path)
    } catch (err) {
        throw new Error(`src/ParseServer.js not found.\n\n${moreDetails}`)
    }

    if (content.includes('moralis-syncs-server-plugin')) {
        throw new Error('Prepare script already applied. Undo using the eject command.')
    }
}

function applyPatch (patch, opts = '') {
    execSync(`git apply ${opts} ${resolve(__dirname, patch)}`, { stdio: [null, null, null] })
}

function printLogo () {
    console.log(logo)
}

function printSuccess (text) {
    console.log(colors.green('Success'))
    console.log(text)
}

function printError (err) {
    console.log(colors.red('Error'))
    console.log(err.message)
}