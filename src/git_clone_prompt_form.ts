import { Widget } from '@phosphor/widgets';

namespace Private {
    export function createNode(): HTMLElement {
      const node = document.createElement('div');
      const label = document.createElement('label');
      const input = document.createElement('input');
      const text = document.createElement('span');
      const warning = document.createElement('div');

      node.className = 'jp-FormField';
      warning.className = 'jp-FormField-warning';

      label.appendChild(text);
      label.appendChild(input);
      node.appendChild(label);
      node.appendChild(warning);
      input.type = "text"

      return node;
    }

    export function createContainer(nodes: HTMLElement[]): HTMLElement {
      const container = document.createElement('div');

      nodes.forEach(node => container.appendChild(node));

      return container;
    }
}

  class FormField extends Widget {
    /**
     * Create a redirect form.
     */
    constructor(label: string, placeholder = '', warning: string | null = null, initialValue: string = '') {
      super({ node: Private.createNode()});
      this.label = label;
      this.placeholder = placeholder;
      if (warning) this.warning = warning;
      this.setDefaultValue(initialValue);
    }

    /**
     * The text label of the form.
     */
    get label(): string {
      return this.node.querySelector('label span').textContent;
    }
    set label(label: string) {
      this.node.querySelector('label span').textContent = label;
    }

    /**
     * The input placeholder.
     */
    get placeholder(): string {
      return this.node.querySelector('input').placeholder;
    }
    set placeholder(placeholder: string) {
      this.node.querySelector('input').placeholder = placeholder;
    }

    /**
     * The warning message.
     */
    get warning(): string {
      return this.node.querySelector('.jp-FormField-warning').textContent;
    }
    set warning(warning: string) {
      this.node.querySelector('.jp-FormField-warning').textContent = warning;
    }

    setDefaultValue(value: string) {
      this.node.querySelector('input').defaultValue = value;
    }

    /**
     * Returns the input value.
     */
    getValue(): string {
      return this.node.querySelector('input').value;
    }

  }

  export class GitClonePromptForm extends Widget {

    private readonly gitURL: FormField;
    private readonly localDir: FormField;

    constructor(warnText?: string) {
      const gitURL = new FormField('Git Repo ', 'URL', warnText);
      const localDir = new FormField('Local dir ', 'Directory', warnText);
      super({ node: Private.createContainer([gitURL.node,localDir.node ])})

      this.gitURL = gitURL;
      this.localDir = localDir
    }

    getValue(): string {
      return this.gitURL.getValue() + "|" + this.localDir.getValue()
    }
  }