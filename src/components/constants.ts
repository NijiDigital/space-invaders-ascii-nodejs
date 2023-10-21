import { join } from 'node:path'

import { baseDir } from '../util/base-dir'

const Constants = Object.freeze({
  alien: {
    colors: {
      alien1: '#62DE6D',
      alien2: '#42E9F4',
      alien3: '#DB55DD',
    },
    contents: {
      alien1: [
        [' {@@} ', ' /""\\ '],
        [' {@@} ', '  \\/  '],
      ],
      alien2: [
        [' dOOb ', ' ^/\\^ '],
        [' dOOb ', ' ~||~ '],
      ],
      alien3: [
        [' /MM\\ ', ' |~~| '],
        [' /MM\\ ', ' \\~~/ '],
      ],
      exploded: [
        [' \\||/ ', ' /||\\ '],
        ['', ''],
      ],
    },
    height: 2,
    width: 6,
  },
  bullet: {
    color: '#FFFFFF',
  },
  game: {
    backgroundColor: '#000000',
  },
  gunner: {
    contents: {
      exploded: [
        [" ,' %  ", ' ;&+,! '],
        [' -,+$! ', ' +  ^~ '],
      ],
      normal: [' mAm ', 'MAZAM'],
    },
    soundFileShoot: join(baseDir, 'sounds', 'shoot.wav'),
  },
  shelter: {
    color: '#F83B3A',
    height: 3,
    width: 7,
  },
})

export default Constants
