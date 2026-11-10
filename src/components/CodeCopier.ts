/**
 * CODE COPIER COMPONENT
 * Section 02: loader.lua clipboard copy handler with visual feedback
 * Snowy Studios (getsnowy.net)
 */

export class CodeCopier {
  private copyBtn: HTMLElement | null = null;
  private codeSnippet: string = 'loadstring(game:HttpGet("https://flowauth.net/v1/ui/a87f00d9adf63658655fcd02ab86a4ef.lua"))()';
  private feedbackTimer: number | null = null;
  private originalHtml: string = '';

  constructor(buttonId: string, customSnippet?: string) {
    this.copyBtn = document.getElementById(buttonId);
    if (customSnippet) {
      this.codeSnippet = customSnippet;
    }
    if (!this.copyBtn) return;

    const attrCode = this.copyBtn.getAttribute('data-code');
    if (attrCode) {
      this.codeSnippet = attrCode;
    }

    this.originalHtml = this.copyBtn.innerHTML;
    this.copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.copyToClipboard();
    });
  }

  public setCode(code: string): void {
    this.codeSnippet = code;
  }

  private async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.codeSnippet);
      this.showFeedback(true);
    } catch {
      // Fallback for older browsers or non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = this.codeSnippet;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showFeedback(true);
    }
  }

  private showFeedback(success: boolean): void {
    if (!this.copyBtn) return;

    if (this.feedbackTimer !== null) {
      window.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }

    this.copyBtn.classList.add('copied');
    this.copyBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copied to clipboard!</span>
    `;

    this.feedbackTimer = window.setTimeout(() => {
      if (this.copyBtn) {
        this.copyBtn.classList.remove('copied');
        this.copyBtn.innerHTML = this.originalHtml;
      }
      this.feedbackTimer = null;
    }, 2200);
  }
}
