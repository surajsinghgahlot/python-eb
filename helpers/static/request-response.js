// eslint-disable-next-line import/prefer-default-export
export function extractRequestData(reqObject) {
  const { body, params, query, authData, file, files, ip , app } = reqObject;

  const requestData = {
    // ip,
    ...(body && { ...body }),
    ...(app && { app }),
    ...(authData && { authData }),
    ...(file && { file }),
    ...(files && { files }),
    ...(query && { ...query }),
    ...(params.id && { id: params.id }),
    ...(params.slug && { slug: params.slug }),
    ...(params.type && { type: params.type }),
    ...(params.user_id && { user_id: params.user_id }),
    ...(params.name && { name: params.name }),
  };

  return requestData;
}
