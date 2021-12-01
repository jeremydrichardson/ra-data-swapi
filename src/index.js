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

// Need to format some data to work with react-admin
const formatSWAPIData = (resource, record) => {
  switch (resource) {
    case "people":
      return {
        ...record,
        id: urlToId(record.url),
        homeworld: urlToId(record.homeworld),
        films: record.films.map((film) => urlToId(film)),
        species: record.species.map((specie) => urlToId(specie)),
      };
    case "planets":
      return {
        ...record,
        id: urlToId(record.url),
        films: record.films.map((film) => urlToId(film)),
      };
  }
};

export default swapiDataProvider;
