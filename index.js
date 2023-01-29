const path                  = require('path')
    , AppChannel            = require('node-mermaid/store/app-channel')()
    , AppTransportChannel   = require('node-mermaid/store/app-transport-channel')()
    , parser                = require('node-mermaid/parser')

const allowVoice = {}

const voiceMessage = data => {
  if (data.isEasyData) {
    if (data.easyData.events.isMessage) {
      if (data.easyData.message.trim().match(/^@voice/)) {
        if (data.easyData.isModel) {
          const username = data.extension.modelUsername
              , text = data.easyData.message.trim().replace(/@voice/, '')

          AppTransportChannel.writeData({
            type: 'voice',
            data: { username, text }
          })
          return
        }

        if (data.easyData.isUser && allowVoice[data.easyData.username]) {
          const username = data.easyData.username
              , text = data.easyData.message.trim().replace(/@voice/, '')

          allowVoice[username] = false

          AppTransportChannel.writeData({
            type: 'voice',
            data: { username, text }
          })
          // говорит робот!
          return
        } else {
          // чтоб сказать что-то отправь 2 токена
          return
        }
      }
    }

    if (data.easyData.events.isTokens) {
      if (data.easyData.tokenCount === 2) {
        const username = data.easyData.username
            , text = data.easyData.message

        if (text) {
          AppTransportChannel.writeData({
            type: 'voice',
            data: { username, text }
          })
          // говорит робот!
          return
        }

        allowVoice[username] = true
      }
    }
  }
}

AppChannel.on('connect', () => {
  AppTransportChannel.on('connect', () => {
    AppChannel.on('data', data => {
      parser.Chaturbate(data, voiceMessage)
      parser.xHamsterLive(data, voiceMessage)
      parser.Stripchat(data, voiceMessage)
      parser.BongaCams(data, voiceMessage)
    })

    AppChannel.on('reload', () => {
      AppTransportChannel.writeData({
        type: 'reload'
      })
    })
  })
})
