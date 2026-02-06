function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  const id = data.IDxORDENPC;
  if (!id) {
    return ContentService.createTextOutput("IDxORDENPC faltante");
  }

  const GITHUB_TOKEN = "GITHUB_TOKEN_AQUI";
  const OWNER = "tytone1010";
  const REPO = "tickettaller";
  const PATH = "data/" + id + ".json";

  const url = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + PATH;

  const contentBase64 = Utilities.base64Encode(
    JSON.stringify(data, null, 2)
  );

  // Ver si el archivo ya existe (para obtener SHA)
  let sha = null;
  try {
    const resp = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        Authorization: "token " + GITHUB_TOKEN
      }
    });
    sha = JSON.parse(resp.getContentText()).sha;
  } catch (e) {
    // no existe, se crea
  }

  const payload = {
    message: "Ticket " + id,
    content: contentBase64
  };

  if (sha) payload.sha = sha;

  UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    headers: {
      Authorization: "token " + GITHUB_TOKEN
    },
    payload: JSON.stringify(payload)
  });

  return ContentService.createTextOutput("OK");
}
