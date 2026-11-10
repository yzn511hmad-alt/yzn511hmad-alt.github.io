/** The current design phase uses the same Polar Night palette on every page. */
export type Theme = 'dark' | 'light';

export class ThemeManager {
  private listeners:Array<(theme:Theme)=>void>=[];
  constructor(){
    const root=document.documentElement;
    root.dataset.theme='dark';root.dataset.themePreset='polar-night';
    root.classList.remove('light');root.classList.add('dark');
    try{localStorage.setItem('snowy-theme-preset','polar-night');localStorage.removeItem('snowy-theme');}catch{/* Storage is optional. */}
  }
  toggle():Theme { return 'dark'; }
  get theme():Theme { return 'dark'; }
  onThemeChange(callback:(theme:Theme)=>void):()=>void {
    this.listeners.push(callback);callback('dark');
    return()=>{this.listeners=this.listeners.filter(item=>item!==callback);};
  }
}
