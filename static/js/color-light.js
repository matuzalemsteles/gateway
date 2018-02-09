/**
 * Color Bulb.
 *
 * UI element representing a bulb with control over its color
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/* globals ColorDetail, OnOffDetail, OnOffSwitch, Thing, ThingDetailLayout */

/**
 * ColorLight Constructor (extends OnOffSwitch).
 *
 * @param Object description Thing description object.
 * @param {String} format 'svg', 'html', or 'htmlDetail'.
 */
function ColorLight(description, format) {
  if (format === 'htmlDetail') {
    this.details = this.details || {};
    this.details.on = new OnOffDetail(this);
    this.details.color = new ColorDetail(this);
  }

  this.base = Thing;
  this.base(description, format, {svgBaseIcon: '/images/bulb.svg',
                                  pngBaseIcon: '/images/bulb.png',
                                  thingCssClass: 'color-light-container',
                                  addIconToView: false});

  if (format == 'svg') {
    // For now the SVG view is just a link.
    return this;
  }
  this.onPropertyUrl = new URL(this.propertyDescriptions.on.href, this.href);
  this.colorPropertyUrl = new URL(this.propertyDescriptions.color.href,
                                  this.href);

  this.updateStatus();
  this.colorLight = this.element.querySelector('.color-light');
  this.colorLightLabel = this.element.querySelector('.color-light-label');
  this.colorLightIconPath =
    this.element.querySelector('.color-light-icon-path');

  if (format === 'htmlDetail') {
    for (let prop in this.details) {
      this.details[prop].attach();
    }

    this.colorInput = this.element.querySelector('.color-light-color');
    this.colorInput.addEventListener('change', () => {
      this.setColor(this.colorInput.value);
    });

    this.layout = new ThingDetailLayout(
      this.element.querySelectorAll('.thing-detail-container'));
  } else {
    this.colorLight.addEventListener('click', this.handleClick.bind(this));
  }
  return this;
}

ColorLight.prototype = Object.create(OnOffSwitch.prototype);

ColorLight.prototype.iconView = function() {
  return `<div class="color-light">
    <div class="color-light-icon">
    <svg width="66" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 512 512">
      <g>
        <g>
          <path fill="currentColor" d="m256,92.3c-74.2,0-127.8,55.3-136.3,114.7-5.3,39.6 7.5,78.2 34.1,107.4 23.4,25 36.2,58.4 36.2,92.8l-.1,54.2c0,21.9 18.1,39.6 40.5,39.6h52.2c22.4,0 40.5-17.7 40.5-39.6l.1-54.2c0-35.4 11.7-67.8 34.1-90.7 24.5-25 37.3-57.3 37.3-90.7-0.1-74.1-63-133.5-138.6-133.5zm46.8,369.1c0,10.4-8.5,18.8-19.2,18.8h-52.2c-10.7,0-19.2-8.3-19.2-18.8v-24h90.5v24zm39.6-159.5c-26.6,27.1-40.5,64.6-40.5,105.3v9.4h-90.5v-9.4c0-38.6-16-77.1-42.6-106.3-23.4-25-33-57.3-28.8-90.7 7.5-50 54-97 116.1-97 65,0 117.2,51.1 117.2,112.6 0,28.1-10.7,55.2-30.9,76.1z"/>
          <rect fill="currentColor" width="21.3" x="245.3" y="11" height="50"/>
          <polygon fill="currentColor" points="385.1,107.4 400,122.3 436.5,87.2 421.5,72.3   "/>
          <rect fill="currentColor" width="52.2" x="448.8" y="236.2" height="20.9"/>
          <rect fill="currentColor" width="52.2" x="11" y="236.2" height="20.9"/>
          <polygon fill="currentColor" points="90.1,72.2 75.1,87.1 111.6,122.2 126.5,107.3   "/>
        </g>
      </g>
    </svg>
      <div class="color-light-label">
        ON
      </div>
    </div>
  </div>`;
};

/**
 * HTML view for Color bulb
 */
ColorLight.prototype.htmlView = function() {
  return `<div class="thing ${this.thingCssClass}">
    <a href="${this.href}" class="thing-details-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
    </a>
    ${this.iconView()}
    <span class="thing-name">${this.name}</span>
  </div>`;
};

/**
 * HTML detail view for Color bulb
 */
ColorLight.prototype.htmlDetailView = function() {
  let detailsHTML = '';
  for (let prop in this.details) {
    detailsHTML += this.details[prop].view();
  }

  return `<div class="color-light-container">
    <div class="thing">
      ${this.iconView()}
    </div>
    ${detailsHTML}
  </div>`;
};

/**
 * Update the status of the light.
 */
ColorLight.prototype.updateStatus = function() {
  var opts = {
    headers: {
      'Authorization': `Bearer ${window.API.jwt}`,
      'Accept': 'application/json'
    }
  };

  fetch(this.onPropertyUrl, opts).then(response => {
    return response.json();
  }).then(response => {
    this.onPropertyStatus(response);
    return fetch(this.colorPropertyUrl, opts);
  }).then(response => {
    return response.json();
  }).then(response => {
    this.onPropertyStatus(response);
  }).catch(error => {
    console.error('Error fetching on/off switch status ' + error);
  });
};

/**
 * Handle a 'propertyStatus' message
 * @param {Object} properties - property data
 */
ColorLight.prototype.onPropertyStatus = function(data) {
  if (data.hasOwnProperty('on')) {
    this.updateOn(data.on);
  }
  if (data.hasOwnProperty('color')) {
    this.updateColor(data.color);
  }
};

ColorLight.prototype.updateOn = function(on) {
  this.properties.on = on;
  if (on === null) {
    return;
  }

  let onoff = on ? 'on' : 'off';
  this.colorLightLabel.textContent = onoff;

  if (this.details) {
    this.details.on.update();
  }

  if (on) {
    this.showOn();
  } else {
    this.showOff();
  }
};

ColorLight.prototype.updateColor = function(color) {
  if (!color) {
    return;
  }
  this.properties.color = color;
  if (!this.colorLight) {
    return;
  }
  this.colorLightIconPath.style.fill = color;

  if (this.details) {
    this.details.color.update();
  }

  let r = parseInt(color.substr(1,2), 16);
  let g = parseInt(color.substr(3,2), 16);
  let b = parseInt(color.substr(5,2), 16);

  // From https://stackoverflow.com/questions/3942878/
  if (r * 0.299 + g * 0.587 + b * 0.114 > 186) {
    this.colorLight.classList.add('bright-color');
  } else {
    this.colorLight.classList.remove('bright-color');
  }
};

ColorLight.prototype.setColor = function(color) {
  const payload = {
   color: color
  };
  fetch(this.colorPropertyUrl, {
   method: 'PUT',
   body: JSON.stringify(payload),
   headers: Object.assign(window.API.headers(), {
     'Content-Type': 'application/json'
   })
  }).then(response => {
   if (response.status === 200) {
     this.updateColor(color);
   } else {
     console.error('Status ' + response.status + ' trying to set color');
   }
  }).catch(function(error) {
   console.error('Error trying to set color: ' + error);
  });

};
