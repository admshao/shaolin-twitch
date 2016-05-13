# shaolin-twitch
The on-stream graphics used on twitch.tv/shaolindota channel.

# agdq16-layouts
The on-stream graphics used during Awesome Games Done Quick 2016.

This was heavily based on [agdq16-layouts](https://github.com/GamesDoneQuick/agdq16-layouts) so big thanks to Alex and Chris

This is a [NodeCG](https://github.com/nodecg/nodecg) ~0.7.0 bundle. You will need to have NodeCG ~0.7.0 installed to run it.
It IS NOT compatible with ~0.8.0

## Video Walkthrough on NodeCG
[A ten-part video series explaining the structure and function of this NodeCG bundle.](https://www.youtube.com/playlist?list=PL1EO2PfU4nFnB4c40SzUpulvYvVmPxeTx)

## Installation
- Install to `nodecg/bundles/shaolin-twitch`.
- Install `bower` if you have not already (`npm install -g bower`)
- **WINDOWS**: Follow [these instructions](https://github.com/nodejs/node-gyp/issues/629#issuecomment-153196245) to set up a build chain to compile `shaolin-twitch`' dependencies.
- **LINUX**: Install `build-essential` and Python 2.7, which are needed to compile `shaolin-twitch`' dependencies.
- `cd nodecg/bundles/shaolin-twitch` and run `npm install`, then `bower install`
- Create the configuration file `nodecg/cfg/shaolin-twitch.json` based on `nodecg/bundles/shaolin-twitch/configschema.json`
- Run the nodecg server: `nodecg start` (or `node index.js` if you don't have nodecg-cli) from the `nodecg` root directory.
- Run the electron window:
  - For Windows:
    - Create a shortcut in the `bundles/shaolin-twitch` folder with the location set to
      `C:\path\to\nodecg\bundles\shaolin-twitch\node_modules\electron-prebuilt\dist\electron.exe` called Electron.
    - Next, edit the properties of the link you created, add ` electron.js --remote-debugging-port=9222` to the end of
      the `Target` value, and change the `Start in` folder to be `C:\path\to\nodecg\bundles\shaolin-twitch\`.
  - For Linux/Mac:
    - `cd` to the `bundles/agdq16-bundles` directory, then run `./node_modules/electron-prebuild/dist/electron electron.js --remote-debugging-port=9222`

Please note that you **must manually run `npm install` for this bundle**. NodeCG currently cannot reliably 
compile this bundle's npm dependencies. This is an issue we hope to address in the future.

## Usage
This bundle is not intended to be used verbatim. Many of the assets have been replaced with placeholders, and
most of the data sources are hardcoded. We are open-sourcing this bundle in hopes that people will use it as a
learning tool and base to build from, rather than just taking and using it wholesale in their own productions.

To reiterate, please don't just download and use this bundle as-is. Build something new from it.

Example config:
```json
{
  "twitter": {
    "userId": "1234",
    "consumerKey": "aaa",
    "consumerSecret": "bbb",
    "accessTokenKey": "ccc",
    "accessTokenSecret": "ddd"
  },
  "lastfm": {
    "apiKey": "eee",
    "secret": "fff",
    "targetAccount": "youraccount"
  },
  "debug": true
}
```

## Fonts
shaolin-twitch relies on the following [TypeKit](https://typekit.com/) fonts and weights:

 - Proxima Nova
  - Semibold
  - Bold
  - Extrabold
  - Black

If you wish to access shaolin-twitch from anything other than `localhost`, 
you will need to make your own TypeKit with these fonts and whitelist the appropriate addresses.

## License
shaolin-twitch is provided under the Apache v2 license, which is available to read in the [LICENSE][] file.
[license]: LICENSE

### Credits
Developed by [Support Class](http://supportclass.net/)
 - [Alex "Lange" Van Camp](https://twitter.com/VanCamp/), developer  
 - [Chris Hanel](https://twitter.com/ChrisHanel), designer
