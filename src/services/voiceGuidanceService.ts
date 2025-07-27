import type { RouteStep } from "../types/navigation"

export class VoiceGuidanceService {
  private isEnabled = true
  private lastAnnouncedStep = -1

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  announceInstruction(step: RouteStep, stepIndex: number, distanceToTurn: number) {
    if (!this.isEnabled || stepIndex === this.lastAnnouncedStep) {
      return
    }

    // Announce at different distances
    let shouldAnnounce = false
    let announcement = ""

    if (distanceToTurn <= 50 && distanceToTurn > 20) {
      announcement = `In ${Math.round(distanceToTurn)} meters, ${this.cleanInstruction(step.instruction)}`
      shouldAnnounce = true
    } else if (distanceToTurn <= 20) {
      announcement = this.cleanInstruction(step.instruction)
      shouldAnnounce = true
    }

    if (shouldAnnounce) {
      this.speak(announcement)
      this.lastAnnouncedStep = stepIndex
    }
  }

  announceRerouting() {
    if (this.isEnabled) {
      this.speak("Recalculating route")
    }
  }

  announceNavigationStart() {
    if (this.isEnabled) {
      this.speak("Navigation started")
    }
  }

  announceNavigationComplete() {
    if (this.isEnabled) {
      this.speak("You have arrived at your destination")
    }
  }

  private cleanInstruction(instruction: string): string {
    // Remove HTML tags and clean up instruction text
    return instruction
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  }

  private speak(text: string) {
    // In a real implementation, you would use react-native-tts
    // For now, we'll just log the announcement
    console.log("🔊 Voice Guidance:", text)

    // Simulate voice guidance with a simple alert or console log
    // You can integrate react-native-tts here for actual voice synthesis
  }

  reset() {
    this.lastAnnouncedStep = -1
  }
}

export const voiceGuidanceService = new VoiceGuidanceService()
