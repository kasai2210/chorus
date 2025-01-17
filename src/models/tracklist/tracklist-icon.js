import { trackSongInfo } from '../../utils/song.js'
import { parseNodeString } from '../../utils/parser.js'

export default class TrackListIcon {
    #key
    #store
    #selector

    constructor({ key, store, selector }) {
        this.#key = key
        this.#store = store
        this.#selector = selector
    }

    #getIcon(row) {
        return row.querySelector(this.#selector)
    }

    _setUI(row) {
        if (!row) return

        if (!this.#getIcon(row)) {
            const heartIcon = row.querySelector('button[data-testid="add-button"]')
            const iconEl = parseNodeString(this._iconUI)
            heartIcon?.parentNode?.insertBefore(iconEl, heartIcon) 
        }

        const icon = this.#getIcon(row)

        if (icon) {
            icon.style.display = 'flex'
        }
    }

    _setInitialState(row) {
        const icon = this.#getIcon(row)

        this.#initializeTrack(row)
        this._animate(icon)
    }

    async #initializeTrack(row) {
        const song = trackSongInfo(row)
        if (!song) return

        return await this.#store.getTrack({
            id: song.id,
            value: { isSkipped: false, isSnip: false, startTime: 0, endTime: song.endTime },
        })
    }

    async getTrack(id) {
        return await this.#store.getTrack({ id })
    }

    async _saveTrack(row) {
        const song = trackSongInfo(row)
        if (!song) return

        const snipInfo = await this.getTrack(song.id)

        await this.#store.saveTrack({
            id: song.id,
            value: { ...snipInfo, isSkipped: !snipInfo.isSkipped },
        })
    }

    #getRow(icon) {
        return icon?.parentElement?.parentElement
    }

    async _animate(icon) {
        const row = this.#getRow(icon)
        const song = trackSongInfo(row)

        if (!song) return

        const snipInfo = await this.getTrack(song.id)

        this._burn({ icon, burn: snipInfo[this.#key] })
        this._glow({ icon, glow: snipInfo[this.#key] })
    }

    #getStyleProp(icon) {
        return icon.role == 'snip' ? 'color' : 'fill'
    }

    _burn({ icon, burn }) {
        const svg = icon.querySelector('svg')
        if (burn) {
            icon.style.visibility = 'visible'
        }

        if (icon.role == 'skip') {
            icon.setAttribute('aria-label', `${burn ? 'Uns' : 'S'}kip Song`)
        }

        const styleProp = this.#getStyleProp(icon)
        svg.style[styleProp] = burn ? '#1ed760' : 'currentColor'
    }

    _glow({ icon, glow }) {
        const svg = icon.querySelector('svg')
        const styleProp = this.#getStyleProp(icon)

        svg.addEventListener('mouseover', () => {
            if (glow && svg.style[styleProp] == '#1ed760') return

            svg.style[styleProp] = glow ? '#1ed760' : '#fff'
        })

        svg.addEventListener('mouseleave', () => {
            if (glow && svg.style[styleProp] == '#1ed760') return

            svg.style[styleProp] = glow ? '#1ed760' : 'currentColor'
        })
    }
}
