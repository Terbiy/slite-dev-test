'use strict'

const stylesSymbols = {
  bold: '**',
  italic: '*'
}

class TextPart {
  constructor(text, styles = []) {
    this.text = text
    this.styles = new Set(styles)
  }

  get length() {
    return this.text.length
  }

  toString() {
    return this.text
  }

  toStyledString() {
    const styles = [...this.styles]

    const stylesStart = styles.reduce(this.accumulateStyle, '')
    const stylesEnd = styles.reduceRight(this.accumulateStyle, '')

    return stylesStart + this.text + stylesEnd
  }

  accumulateStyle(accumulated, style) {
    return accumulated + stylesSymbols[style]
  }

  format(style) {
    this.styles.add(style)

    return this
  }

  insert(text, position = this.text.length) {
    if (position < 0 || this.text.length < position) {
      throw new Error({
        message:
          'Not possible to paste additional text outside the original one.'
      })
    }

    this.text = this.text.slice(0, position) + text + this.text.slice(position)

    return this
  }

  getSplit({ start = 0, end = this.length }) {
    const { text } = this
    const { length } = text

    const startIsOutside = start < 0 || length < start
    const endIsOutside = end < 0 || length < end
    if (startIsOutside || endIsOutside || start > end) {
      throw new Error({
        message: 'Not possible to split text part outside its boundaries.'
      })
    }

    if (start === 0 && end === length) {
      return {
        desired: this
      }
    }

    const styles = [...this.styles]

    if (start && end !== length) {
      return {
        start: new TextPart(text.slice(0, start), styles),
        desired: new TextPart(text.slice(start, end), styles),
        end: new TextPart(text.slice(end, length), styles)
      }
    }

    if (start) {
      return {
        start: new TextPart(text.slice(0, start), styles),
        desired: new TextPart(text.slice(start, length), styles)
      }
    }

    if (end !== length) {
      return {
        desired: new TextPart(text.slice(0, end), styles),
        end: new TextPart(text.slice(end, length), styles)
      }
    }

    return this
  }
}

module.exports = {
  TextPart
}
