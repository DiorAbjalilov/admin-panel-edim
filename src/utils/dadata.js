export const getSuggest = (query, city) => {
  const url =
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
  // const token = "8753acf913358e811317d42c5de9ae8507ef716e";
  const token = "e4da68117133149ecd4eaa4d66deab0c1cc12345";

  var options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Token " + token,
    },
    body: JSON.stringify({
      query,
      count: 10,
      // locations: city ? [{ city }] : [{ kladr_id: "14" }],
      language: "en",
      locations: [
        {
          country: "Узбекистан",
        },
      ],
    }),
  };

  return fetch(url, options);
};

export const cityParser = (suggestions) => {
  const arr = [];
  for (let item of suggestions) {
    const { data } = item;
    let _value = "";
    if (data.city) {
      const area = data.settlement ? ", " + data.settlement : "";
      _value = data.city + area;
    } else if (data.settlement) {
      const area = data.area ? data.area + ", " : "";
      _value = area + data.settlement;
    }
    if (_value && !arr.find((exist) => exist.value === _value)) {
      arr.push({
        value: _value,
        label: _value,
        data,
      });
    }
  }
  return arr;
};

export const getCity = (query) => {
  const url =
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
  const token = "e4da68117133149ecd4eaa4d66deab0c1cc12345";

  var options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Token " + token,
    },
    body: JSON.stringify({
      query,
      count: 10,
      locations: [
        {
          region: "Якутия",
        },
      ],
    }),
  };

  return fetch(url, options);
};
