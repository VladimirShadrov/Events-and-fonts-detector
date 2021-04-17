const fontCheck = new Set(
  [
    'Arial',
    'Arial Black',
    'Bahnschrift',
    'Calibri',
    'Cambria',
    'Cambria Math',
    'Candara',
    'Comic Sans MS',
    'Consolas',
    'Constantia',
    'Corbel',
    'Courier New',
    'Ebrima',
    'Franklin Gothic Medium',
    'Gabriola',
    'Gadugi',
    'Georgia',
    'HoloLens MDL2 Assets',
    'Impact',
    'Ink Free',
    'Javanese Text',
    'Leelawadee UI',
    'Lucida Console',
    'Lucida Sans Unicode',
    'Malgun Gothic',
    'Marlett',
    'Microsoft Himalaya',
    'Microsoft JhengHei',
    'Microsoft New Tai Lue',
    'Microsoft PhagsPa',
    'Microsoft Sans Serif',
    'Microsoft Tai Le',
    'Microsoft YaHei',
    'Microsoft Yi Baiti',
    'MingLiU-ExtB',
    'Mongolian Baiti',
    'MS Gothic',
    'MV Boli',
    'Myanmar Text',
    'Nirmala UI',
    'Palatino Linotype',
    'Segoe MDL2 Assets',
    'Segoe Print',
    'Segoe Script',
    'Segoe UI',
    'Segoe UI Historic',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'SimSun',
    'Sitka',
    'Sylfaen',
    'Symbol',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
    'Webdings',
    'Wingdings',
    'Yu Gothic',
    'American Typewriter',
    'Andale Mono',
    'Arial',
    'Arial Black',
    'Arial Narrow',
    'Arial Rounded MT Bold',
    'Arial Unicode MS',
    'Avenir',
    'Avenir Next',
    'Avenir Next Condensed',
    'Baskerville',
    'Big Caslon',
    'Bodoni 72',
    'Bodoni 72 Oldstyle',
    'Bodoni 72 Smallcaps',
    'Bradley Hand',
    'Brush Script MT',
    'Chalkboard',
    'Chalkboard SE',
    'Chalkduster',
    'Charter',
    'Cochin',
    'Comic Sans MS',
    'Copperplate',
    'Courier',
    'Courier New',
    'Didot',
    'DIN Alternate',
    'DIN Condensed',
    'Futura',
    'Geneva',
    'Georgia',
    'Gill Sans',
    'Helvetica',
    'Helvetica Neue',
    'Herculanum',
    'Hoefler Text',
    'Impact',
    'Lucida Grande',
    'Luminari',
    'Marker Felt',
    'Menlo',
    'Microsoft Sans Serif',
    'Monaco',
    'Noteworthy',
    'Optima',
    'Palatino',
    'Papyrus',
    'Phosphate',
    'Rockwell',
    'Savoye LET',
    'SignPainter',
    'Skia',
    'Snell Roundhand',
    'Tahoma',
    'Times',
    'Times New Roman',
    'Trattatello',
    'Trebuchet MS',
    'Verdana',
    'Zapfino',
  ].sort()
);

/**
 * @typedef {Object} GlobalScope
 * @property {Window} win
 * @property {Document} doc
 * @property {Navigator} nav
 */

class EventModule {
  async start(scope, readinessCallback) {
    //throw new Error('Need to implement method');
    scope = window;
    readinessCallback = listenEventInEventModule.bind(this);
    this.eventInEventModule = [];

    scope.addEventListener('copy', readinessCallback);
  }

  async stop() {
    //throw new Error('Need to implement method');
    window.removeEventListener('copy', listenEventInEventModule);
  }
}

class ExecModule {
  /**
   * @param {GlobalScope} scope
   * @return {Promise<{}>}
   */
  async exec(scope) {
    //throw new Error('Need to implement method');
    scope = document;

    scope.fonts.ready;
    const fontAvailable = [];

    for (let font of fontCheck.values()) {
      if (scope.fonts.check(`12px "${font}"`)) {
        fontAvailable.push(font);
      }
    }

    return fontAvailable.join(',');
  }
}

class Queue {
  /**
   * @param {string} name
   * @param {GlobalScope} scope
   * @param {function} readinessCallback
   */
  constructor(name, scope, readinessCallback) {
    this.name = name;
    this.readinessCallback = readinessCallback;
    this.scope = scope;
    this.queue = [];
  }

  /**
   * @param {ExecModule|EventModule} module
   * @param {number} [timeout]
   */
  add(module, timeout = 0) {
    if (!(module instanceof ExecModule) && !(module instanceof EventModule)) {
      throw Error(
        'Module is not supported. One of ExecModule or EventModule instance is expected.'
      );
    }
    this.queue.push({ module, timeout });
  }

  start() {
    let timeout = 0;
    const count = this.queue.length;
    const callback = this.readinessCallback;
    for (let i = 0; i < count; i++) {
      const { module } = this.queue[i];
      timeout += this.queue[i].timeout;
      this.queue[i].queuedId = setTimeout(() => {
        if (module instanceof ExecModule) {
          module.exec(this.scope).then((params = {}) => callback(params));
        }
        if (module instanceof EventModule) {
          module.start(this.scope, callback);
        }
      }, timeout);
    }
  }

  stop() {
    const count = this.queue.length;
    for (let i = 0; i < count; i++) {
      if (this.queue[i].queuedId) {
        if (this.queue[i].module instanceof EventModule) {
          this.queue[i].module.stop();
        }
        clearTimeout(this.queue[i].queuedId);
      }
    }
  }
}

class CopyPasteEventModule extends EventModule {
  async start(scope, readinessCallback) {
    // this method need to be implemented
    // when event has happened readinessCallback need to be called with detected events
    this.eventInCopyPasteEventModule = [];

    return super.start(scope, readinessCallback);
  }

  async stop() {
    // this method need to be implemented
    return super.stop();
  }
}

class FontsDetectionModule extends ExecModule {
  async exec(scope) {
    // this method need to be implemented
    return super.exec(scope);
  }
}

(async (win, doc, nav) => {
  /**
   * @param {Object} params
   */
  const callback = function (params = {}) {
    console.log('Params were fetched from module', params);
  };

  const qe = new Queue('events', { win, doc, nav }, callback);
  qe.add(new CopyPasteEventModule(), 2000);
  qe.start();

  const qd = new Queue('data', { win, doc, nav }, callback);
  qd.add(new FontsDetectionModule(), 1000);
  qd.start();
})(window, document, navigator);

function listenEventInEventModule() {
  this.eventInEventModule.push('Event COPY detected in EventModule');
  this.eventInCopyPasteEventModule.push(
    'Event COPY detected in CopyPasteEventModule'
  );

  const readinessCallback = (data) => {
    console.log(`Module detected the following events: ${data}`);
  };

  if (
    this.eventInEventModule.length &&
    this.eventInCopyPasteEventModule.length
  ) {
    readinessCallback(
      this.eventInEventModule
        .concat(this.eventInCopyPasteEventModule)
        .join(', ')
    );
  }
}
