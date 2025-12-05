import React, { useState } from 'react';
import './JapanProvinceMap.css';
import { provincePaths, provinceCenters } from './JapanProvinceMapPaths.js';

/**
 * Interactive map of historical Japanese provinces (old provinces/kuni)
 * Highlights the Gokaden (五箇伝) - five traditional sword-making traditions
 */

// Province data with metadata
// Organized by region following the traditional classification
const provinces = {
  // Gokaden provinces (highlighted)
  yamato: { id: 'yamato', name: 'Yamato', nameJp: '大和', number: 30, den: 'yamato', region: 'kinai' },
  yamashiro: { id: 'yamashiro', name: 'Yamashiro', nameJp: '山城', number: 29, den: 'yamashiro', region: 'kinai' },
  sagami: { id: 'sagami', name: 'Sagami', nameJp: '相模', number: 54, den: 'soshu', region: 'tokaido' },
  bizen: { id: 'bizen', name: 'Bizen', nameJp: '備前', number: 41, den: 'bizen', region: 'sanyo' },
  mino: { id: 'mino', name: 'Mino', nameJp: '美濃', number: 49, den: 'mino', region: 'tokaido' },

  // Hokkaido
  ezo: { id: 'ezo', name: 'Ezo', nameJp: '蝦夷', number: 1, region: 'hokkaido' },

  // Tohoku (Mutsu & Dewa)
  mutsu: { id: 'mutsu', name: 'Mutsu', nameJp: '陸奥', number: 2, region: 'tohoku' },
  dewa: { id: 'dewa', name: 'Dewa', nameJp: '出羽', number: 3, region: 'tohoku' },

  // Hokuriku
  wakasa: { id: 'wakasa', name: 'Wakasa', nameJp: '若狭', number: 19, region: 'hokuriku' },
  echizen: { id: 'echizen', name: 'Echizen', nameJp: '越前', number: 4, region: 'hokuriku' },
  kaga: { id: 'kaga', name: 'Kaga', nameJp: '加賀', number: 5, region: 'hokuriku' },
  noto: { id: 'noto', name: 'Noto', nameJp: '能登', number: 6, region: 'hokuriku' },
  etchu: { id: 'etchu', name: 'Etchu', nameJp: '越中', number: 7, region: 'hokuriku' },
  echigo: { id: 'echigo', name: 'Echigo', nameJp: '越後', number: 8, region: 'hokuriku' },
  sado: { id: 'sado', name: 'Sado', nameJp: '佐渡', number: 9, region: 'hokuriku' },

  // Kanto
  hitachi: { id: 'hitachi', name: 'Hitachi', nameJp: '常陸', number: 10, region: 'kanto' },
  shimotsuke: { id: 'shimotsuke', name: 'Shimotsuke', nameJp: '下野', number: 11, region: 'kanto' },
  kozuke: { id: 'kozuke', name: 'Kozuke', nameJp: '上野', number: 12, region: 'kanto' },
  musashi: { id: 'musashi', name: 'Musashi', nameJp: '武蔵', number: 53, region: 'kanto' },
  shimosa: { id: 'shimosa', name: 'Shimosa', nameJp: '下総', number: 55, region: 'kanto' },
  kazusa: { id: 'kazusa', name: 'Kazusa', nameJp: '上総', number: 56, region: 'kanto' },
  awa_kanto: { id: 'awa_kanto', name: 'Awa', nameJp: '安房', number: 57, region: 'kanto' },

  // Tokaido
  izu: { id: 'izu', name: 'Izu', nameJp: '伊豆', number: 52, region: 'tokaido' },
  suruga: { id: 'suruga', name: 'Suruga', nameJp: '駿河', number: 51, region: 'tokaido' },
  totomi: { id: 'totomi', name: 'Totomi', nameJp: '遠江', number: 50, region: 'tokaido' },
  mikawa: { id: 'mikawa', name: 'Mikawa', nameJp: '三河', number: 64, region: 'tokaido' },
  owari: { id: 'owari', name: 'Owari', nameJp: '尾張', number: 63, region: 'tokaido' },
  shima: { id: 'shima', name: 'Shima', nameJp: '志摩', number: 62, region: 'tokaido' },
  ise: { id: 'ise', name: 'Ise', nameJp: '伊勢', number: 48, region: 'tokaido' },
  iga: { id: 'iga', name: 'Iga', nameJp: '伊賀', number: 47, region: 'tokaido' },
  kai: { id: 'kai', name: 'Kai', nameJp: '甲斐', number: 13, region: 'tokaido' },
  shinano: { id: 'shinano', name: 'Shinano', nameJp: '信濃', number: 14, region: 'tokaido' },
  hida: { id: 'hida', name: 'Hida', nameJp: '飛騨', number: 15, region: 'tokaido' },

  // Kinai
  settsu: { id: 'settsu', name: 'Settsu', nameJp: '摂津', number: 28, region: 'kinai' },
  kawachi: { id: 'kawachi', name: 'Kawachi', nameJp: '河内', number: 31, region: 'kinai' },
  izumi: { id: 'izumi', name: 'Izumi', nameJp: '和泉', number: 32, region: 'kinai' },

  // San'in
  tamba: { id: 'tamba', name: 'Tamba', nameJp: '丹波', number: 20, region: 'sanin' },
  tango: { id: 'tango', name: 'Tango', nameJp: '丹後', number: 21, region: 'sanin' },
  tajima: { id: 'tajima', name: 'Tajima', nameJp: '但馬', number: 22, region: 'sanin' },
  inaba: { id: 'inaba', name: 'Inaba', nameJp: '因幡', number: 23, region: 'sanin' },
  hoki: { id: 'hoki', name: 'Hoki', nameJp: '伯耆', number: 24, region: 'sanin' },
  izumo: { id: 'izumo', name: 'Izumo', nameJp: '出雲', number: 25, region: 'sanin' },
  iwami: { id: 'iwami', name: 'Iwami', nameJp: '石見', number: 26, region: 'sanin' },
  oki: { id: 'oki', name: 'Oki', nameJp: '隠岐', number: 27, region: 'sanin' },

  // San'yo
  harima: { id: 'harima', name: 'Harima', nameJp: '播磨', number: 33, region: 'sanyo' },
  mimasaka: { id: 'mimasaka', name: 'Mimasaka', nameJp: '美作', number: 34, region: 'sanyo' },
  bingo: { id: 'bingo', name: 'Bingo', nameJp: '備後', number: 40, region: 'sanyo' },
  bitchu: { id: 'bitchu', name: 'Bitchu', nameJp: '備中', number: 39, region: 'sanyo' },
  aki: { id: 'aki', name: 'Aki', nameJp: '安芸', number: 38, region: 'sanyo' },
  suo: { id: 'suo', name: 'Suo', nameJp: '周防', number: 37, region: 'sanyo' },
  nagato: { id: 'nagato', name: 'Nagato', nameJp: '長門', number: 36, region: 'sanyo' },

  // Nankaido
  kii: { id: 'kii', name: 'Kii', nameJp: '紀伊', number: 35, region: 'nankaido' },
  awaji: { id: 'awaji', name: 'Awaji', nameJp: '淡路', number: 58, region: 'nankaido' },
  awa_shikoku: { id: 'awa_shikoku', name: 'Awa', nameJp: '阿波', number: 59, region: 'nankaido' },
  sanuki: { id: 'sanuki', name: 'Sanuki', nameJp: '讃岐', number: 60, region: 'nankaido' },
  iyo: { id: 'iyo', name: 'Iyo', nameJp: '伊予', number: 61, region: 'nankaido' },
  tosa: { id: 'tosa', name: 'Tosa', nameJp: '土佐', number: 65, region: 'nankaido' },

  // Kyushu
  chikuzen: { id: 'chikuzen', name: 'Chikuzen', nameJp: '筑前', number: 42, region: 'kyushu' },
  chikugo: { id: 'chikugo', name: 'Chikugo', nameJp: '筑後', number: 43, region: 'kyushu' },
  buzen: { id: 'buzen', name: 'Buzen', nameJp: '豊前', number: 44, region: 'kyushu' },
  bungo: { id: 'bungo', name: 'Bungo', nameJp: '豊後', number: 45, region: 'kyushu' },
  hizen: { id: 'hizen', name: 'Hizen', nameJp: '肥前', number: 46, region: 'kyushu' },
  higo: { id: 'higo', name: 'Higo', nameJp: '肥後', number: 66, region: 'kyushu' },
  hyuga: { id: 'hyuga', name: 'Hyuga', nameJp: '日向', number: 67, region: 'kyushu' },
  osumi: { id: 'osumi', name: 'Osumi', nameJp: '大隅', number: 68, region: 'kyushu' },
  satsuma: { id: 'satsuma', name: 'Satsuma', nameJp: '薩摩', number: 69, region: 'kyushu' },
  iki: { id: 'iki', name: 'Iki', nameJp: '壱岐', number: 70, region: 'kyushu' },
  tsushima: { id: 'tsushima', name: 'Tsushima', nameJp: '対馬', number: 71, region: 'kyushu' },
};

// Gokaden information
const gokaden = {
  yamato: { name: 'Yamato Den', nameJp: '大和伝', color: '#8B4513', description: 'Nara area tradition' },
  yamashiro: { name: 'Yamashiro Den', nameJp: '山城伝', color: '#4A0080', description: 'Kyoto tradition' },
  soshu: { name: 'Soshu Den', nameJp: '相州伝', color: '#006400', description: 'Sagami/Kamakura tradition' },
  bizen: { name: 'Bizen Den', nameJp: '備前伝', color: '#8B0000', description: 'Okayama area tradition' },
  mino: { name: 'Mino Den', nameJp: '美濃伝', color: '#B8860B', description: 'Seki area tradition' },
};

const JapanProvinceMap = ({ onProvinceClick, selectedProvince, highlightGokaden = true }) => {
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, province: null });

  const handleMouseEnter = (provinceId, event) => {
    setHoveredProvince(provinceId);
    const rect = event.target.getBoundingClientRect();
    const province = provinces[provinceId];
    if (province) {
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        province
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredProvince(null);
    setTooltip({ visible: false, x: 0, y: 0, province: null });
  };

  const handleClick = (provinceId) => {
    if (onProvinceClick) {
      onProvinceClick(provinces[provinceId]);
    }
  };

  const getProvinceClass = (provinceId) => {
    const province = provinces[provinceId];
    const classes = ['province'];

    if (province?.den && highlightGokaden) {
      classes.push(`den-${province.den}`);
    }

    if (hoveredProvince === provinceId) {
      classes.push('hovered');
    }

    if (selectedProvince === provinceId) {
      classes.push('selected');
    }

    // Default styling for unmapped provinces
    if (!province) {
      classes.push('unmapped');
    }

    return classes.join(' ');
  };

  return (
    <div className="japan-province-map-container">
      <svg
        viewBox="0 0 800 900"
        className="japan-province-map"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Water background */}
        <rect x="0" y="0" width="800" height="900" className="water" />

        {/* Province paths */}
        <g className="provinces">
          {Object.entries(provincePaths).map(([id, path]) => (
            <path
              key={id}
              d={path}
              className={getProvinceClass(id)}
              onMouseEnter={(e) => handleMouseEnter(id, e)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(id)}
              data-province={id}
            />
          ))}
        </g>

        {/* Province labels (numbers) */}
        <g className="province-labels">
          {Object.entries(provinceCenters).map(([id, center]) => {
            const province = provinces[id];
            // Show province number if mapped, otherwise show index
            const label = province ? province.number : id.replace('province_', '');

            return (
              <text
                key={id}
                x={center[0]}
                y={center[1]}
                className="province-number"
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Gokaden Legend */}
      {highlightGokaden && (
        <div className="gokaden-legend">
          <h4>五箇伝 Gokaden</h4>
          <p className="legend-subtitle">Five Traditional Sword-Making Schools</p>
          <div className="legend-items">
            {Object.entries(gokaden).map(([key, den]) => (
              <div key={key} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: den.color }}
                />
                <span className="legend-name">{den.nameJp}</span>
                <span className="legend-name-en">{den.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && tooltip.province && (
        <div
          className="province-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="tooltip-name">{tooltip.province.nameJp}</div>
          <div className="tooltip-name-en">{tooltip.province.name}</div>
          {tooltip.province.den && (
            <div className="tooltip-den">
              {gokaden[tooltip.province.den].nameJp}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JapanProvinceMap;
