import { fetchUtils } from "react-admin";

const swapiDataProvider = (apiUrl, httpClient = fetchUtils.fetchJson) => ({
  getList: async (resource, params) => {
    const url = `${apiUrl}/${resource}?page=${params.pagination.page}`;

    const { json } = await httpClient(url);

    const data = json.results.map((result) =>
      formatSWAPIData(resource, result)
    );

    return {
      data,
      total: json.count,
    };
  },
  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;

    const { json } = await httpClient(url);

    return { data: formatSWAPIData(resource, json) };
  },
  getMany: async (resource, params) => {
    const httpPromises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`)
    );

    const promiseResults = await Promise.all(httpPromises);

    const data = promiseResults.map((result) =>
      formatSWAPIData(resource, result.json)
    );

    return { data: data };
  },
});

const urlToId = (url) => parseInt(url.match(/([^/]*)\/*$/)[1]);

const formatSWAPIData = (resource, record) => {
  let data;

  if (resource === "people") {
    data = {
      ...record,
      id: urlToId(record.url),
      homeworld: urlToId(record.homeworld),
      films: record.films.map((film) => urlToId(film)),
      species: record.species.map((specie) => urlToId(specie)),
    };
  }
  if (resource === "planets") {
    data = {
      ...record,
      id: urlToId(record.url),
      films: record.films.map((film) => urlToId(film)),
    };
  }

  return data;
};

export default swapiDataProvider;
