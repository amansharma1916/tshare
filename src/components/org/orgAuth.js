// Org token helpers — scoped to the org namespace in localStorage,
// kept separate from the OrgLayout component so auth storage and the
// layout shell stay decoupled.
export const ORG_STORAGE = {
  token: 'tshare_org_token',
  code: 'tshare_org_code',
  name: 'tshare_org_name',
};

export const getOrgAuth = () => ({
  token: localStorage.getItem(ORG_STORAGE.token) || '',
  orgCode: localStorage.getItem(ORG_STORAGE.code) || '',
  name: localStorage.getItem(ORG_STORAGE.name) || '',
});

export const setOrgAuth = ({ token, orgCode, name }) => {
  if (token) localStorage.setItem(ORG_STORAGE.token, token);
  if (orgCode) {
    localStorage.setItem(ORG_STORAGE.code, orgCode);
    localStorage.setItem(ORG_STORAGE.name, name || '');
  }
};

export const clearOrgAuth = () => {
  localStorage.removeItem(ORG_STORAGE.token);
  localStorage.removeItem(ORG_STORAGE.code);
  localStorage.removeItem(ORG_STORAGE.name);
};

export const orgAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});