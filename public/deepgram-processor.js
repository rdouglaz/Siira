// Deepgram AudioWorklet Processor
// Converts float32 audio to int16 and sends via WebSocket

class DeepgramProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      if (event.data === 'close') {
        this.port.close();
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      const int16Data = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    }
    return true;
  }
}

registerProcessor('deepgram-processor', DeepgramProcessor);