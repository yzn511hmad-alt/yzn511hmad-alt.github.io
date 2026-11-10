/**
 * ACCORDION COMPONENT
 * Section 05: GSAP-powered FAQ Accordion (Item 01 open by default)
 * Snowy Studios (getsnowy.net)
 */

import gsap from 'gsap';

export interface AccordionItemData {
  question: string;
  answer: string;
  isOpenByDefault?: boolean;
}

export class Accordion {
  private container: HTMLElement | null = null;
  private items: AccordionItemData[] = [
    {
      question: 'How quickly does support reply?',
      answer: 'Our team typically responds within 15–30 minutes during standard operating hours. Weekends and holidays can take a little longer.',
      isOpenByDefault: true,
    },
    {
      question: 'I lost access to my premium key.',
      answer: 'You can recover your key instantly by logging into your account via Discord or submitting your transaction ID to our automated bot.',
      isOpenByDefault: false,
    },
    {
      question: 'What if a game patch breaks something?',
      answer: 'Our developers monitor Roblox game patches 24/7. When a game updates, our scripts are typically patched within 1 to 4 hours.',
      isOpenByDefault: false,
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Due to the digital nature of script execution keys, refunds are handled on a case-by-case basis through our support ticket system within 24 hours of purchase.',
      isOpenByDefault: false,
    },
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = this.items.map((item, idx) => `
      <div class="accordion-item ${item.isOpenByDefault ? 'active' : ''}" data-accordion-index="${idx}">
        <button class="accordion-trigger" aria-expanded="${item.isOpenByDefault ? 'true' : 'false'}">
          <span>0${idx + 1} // ${item.question}</span>
          <span class="accordion-indicator">+</span>
        </button>
        <div class="accordion-content" style="${item.isOpenByDefault ? 'height: auto; opacity: 1;' : 'height: 0; opacity: 0;'}">
          <div class="accordion-inner-text">${item.answer}</div>
        </div>
      </div>
    `).join('');

    this.initEvents();
  }

  private initEvents(): void {
    if (!this.container) return;

    const items = this.container.querySelectorAll('.accordion-item');
    items.forEach((item) => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content') as HTMLElement;

      trigger?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        items.forEach((other) => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            other.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
            const otherContent = other.querySelector('.accordion-content') as HTMLElement;
            gsap.to(otherContent, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
          }
        });

        // Toggle clicked item
        if (isActive) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
          gsap.to(content, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          gsap.fromTo(content,
            { height: 0, opacity: 0 },
            { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
          );
        }
      });
    });
  }
}
