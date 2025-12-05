var simplemaps_countrymap_mapdata={
  main_settings: {
   //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",
    
    //State defaults
    state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",
    
    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",
    
    //Label defaults
    label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 16,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "yes",
    hide_labels: "no",
    hide_eastern_labels: "no",
   
    //Zoom settings
    zoom: "yes",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,
    
    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "detect",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    JP01: {
      name: "Izu",
      color: "#4a45bb"
    },
    JP02: {
      name: "Aomori"
    },
    JP03: {
      name: "Iwate"
    },
    JP04: {
      name: "Miyagi"
    },
    JP05: {
      name: "Akita"
    },
    JP06: {
      name: "Yamagata"
    },
    JP07: {
      name: "Fukushima"
    },
    JP08: {
      name: "Ibaraki"
    },
    JP09: {
      name: "Tochigi"
    },
    JP10: {
      name: "Gunma"
    },
    JP11: {
      name: "Saitama"
    },
    JP12: {
      name: "Chiba"
    },
    JP13: {
      name: "Tokyo"
    },
    JP14: {
      name: "Kanagawa"
    },
    JP15: {
      name: "Niigata",
      color: "#f8bc46"
    },
    JP16: {
      name: "Toyama",
      color: "#f8bc46"
    },
    JP17: {
      name: "Ishikawa",
      color: "#f8bc46"
    },
    JP18: {
      name: "Fukui",
      color: "#f8bc46"
    },
    JP19: {
      name: "Yamanashi"
    },
    JP20: {
      name: "Nagano"
    },
    JP21: {
      name: "Gifu"
    },
    JP22: {
      name: "Shizuoka"
    },
    JP23: {
      name: "Aichi"
    },
    JP24: {
      name: "Mie"
    },
    JP25: {
      name: "Shiga"
    },
    JP26: {
      name: "Kyōto"
    },
    JP27: {
      name: "Ōsaka"
    },
    JP28: {
      name: "Hyōgo"
    },
    JP29: {
      name: "Nara"
    },
    JP30: {
      name: "Wakayama"
    },
    JP31: {
      name: "Tottori"
    },
    JP32: {
      name: "Shimane"
    },
    JP33: {
      name: "Okayama"
    },
    JP34: {
      name: "Hiroshima"
    },
    JP35: {
      name: "Yamaguchi"
    },
    JP36: {
      name: "Tokushima"
    },
    JP37: {
      name: "Kagawa"
    },
    JP38: {
      name: "Ehime"
    },
    JP39: {
      name: "Kōchi"
    },
    JP40: {
      name: "Fukuoka"
    },
    JP41: {
      name: "Saga"
    },
    JP42: {
      name: "Nagasaki"
    },
    JP43: {
      name: "Kumamoto"
    },
    JP44: {
      name: "Ōita"
    },
    JP45: {
      name: "Miyazaki"
    },
    JP46: {
      name: "Kagoshima"
    },
    JP47: {
      name: "Okinawa"
    }
  },
  locations: {
    "0": {
      name: "Tokyo",
      lat: "35.685",
      lng: "139.751389"
    }
  },
  labels: {
    JP01: {
      name: "Hokkaidō",
      parent_id: "JP01"
    },
    JP02: {
      name: "Aomori",
      parent_id: "JP02"
    },
    JP03: {
      name: "Iwate",
      parent_id: "JP03"
    },
    JP04: {
      name: "Miyagi",
      parent_id: "JP04"
    },
    JP05: {
      name: "Akita",
      parent_id: "JP05"
    },
    JP06: {
      name: "Yamagata",
      parent_id: "JP06"
    },
    JP07: {
      name: "Fukushima",
      parent_id: "JP07"
    },
    JP08: {
      name: "Ibaraki",
      parent_id: "JP08"
    },
    JP09: {
      name: "Tochigi",
      parent_id: "JP09"
    },
    JP10: {
      name: "Gunma",
      parent_id: "JP10"
    },
    JP11: {
      name: "Saitama",
      parent_id: "JP11"
    },
    JP12: {
      name: "Chiba",
      parent_id: "JP12"
    },
    JP13: {
      name: "Tokyo",
      parent_id: "JP13"
    },
    JP14: {
      name: "Kanagawa",
      parent_id: "JP14"
    },
    JP15: {
      name: "Echigo",
      parent_id: "JP15"
    },
    JP16: {
      name: "Etchu",
      parent_id: "JP16"
    },
    JP17: {
      name: "Ishikawa",
      parent_id: "JP17"
    },
    JP18: {
      name: "Fukui",
      parent_id: "JP18"
    },
    JP19: {
      name: "Yamanashi",
      parent_id: "JP19"
    },
    JP20: {
      name: "Nagano",
      parent_id: "JP20"
    },
    JP21: {
      name: "Gifu",
      parent_id: "JP21"
    },
    JP22: {
      name: "Shizuoka",
      parent_id: "JP22"
    },
    JP23: {
      name: "Aichi",
      parent_id: "JP23"
    },
    JP24: {
      name: "Mie",
      parent_id: "JP24"
    },
    JP25: {
      name: "Shiga",
      parent_id: "JP25"
    },
    JP26: {
      name: "Kyōto",
      parent_id: "JP26"
    },
    JP27: {
      name: "Ōsaka",
      parent_id: "JP27"
    },
    JP28: {
      name: "Hyōgo",
      parent_id: "JP28"
    },
    JP29: {
      name: "Nara",
      parent_id: "JP29"
    },
    JP30: {
      name: "Wakayama",
      parent_id: "JP30"
    },
    JP31: {
      name: "Tottori",
      parent_id: "JP31"
    },
    JP32: {
      name: "Shimane",
      parent_id: "JP32"
    },
    JP33: {
      name: "Okayama",
      parent_id: "JP33"
    },
    JP34: {
      name: "Hiroshima",
      parent_id: "JP34"
    },
    JP35: {
      name: "Yamaguchi",
      parent_id: "JP35"
    },
    JP36: {
      name: "Tokushima",
      parent_id: "JP36"
    },
    JP37: {
      name: "Kagawa",
      parent_id: "JP37"
    },
    JP38: {
      name: "Ehime",
      parent_id: "JP38"
    },
    JP39: {
      name: "Kōchi",
      parent_id: "JP39"
    },
    JP40: {
      name: "Fukuoka",
      parent_id: "JP40"
    },
    JP41: {
      name: "Saga",
      parent_id: "JP41"
    },
    JP42: {
      name: "Nagasaki",
      parent_id: "JP42"
    },
    JP43: {
      name: "Kumamoto",
      parent_id: "JP43"
    },
    JP44: {
      name: "Ōita",
      parent_id: "JP44"
    },
    JP45: {
      name: "Miyazaki",
      parent_id: "JP45"
    },
    JP46: {
      name: "Kagoshima",
      parent_id: "JP46"
    },
    JP47: {
      name: "Okinawa",
      parent_id: "JP47"
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};