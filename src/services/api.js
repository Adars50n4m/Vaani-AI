import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for audio generation
})

export const generateTTS = async (params) => {
  const formData = new FormData()
  
  formData.append('text', params.text)
  formData.append('exaggeration', params.exaggeration)
  formData.append('temperature', params.temperature)
  formData.append('cfg_weight', params.cfgWeight)
  formData.append('min_p', params.minP)
  formData.append('top_p', params.topP)
  formData.append('repetition_penalty', params.repetitionPenalty)
  formData.append('seed', params.seed)
  formData.append('language', params.language)
  
  if (params.referenceAudio) {
    formData.append('reference_audio', params.referenceAudio)
  }

  try {
    const response = await api.post('/tts/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate TTS')
  }
}

export const generateVC = async (params) => {
  const formData = new FormData()
  
  formData.append('source_audio', params.sourceAudio)
  
  if (params.targetVoice) {
    formData.append('target_voice', params.targetVoice)
  }

  try {
    const response = await api.post('/vc/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to convert voice')
  }
}

export default api