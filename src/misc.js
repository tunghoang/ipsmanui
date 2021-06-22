function engineTypeLabel(idEnginetype, engineTypes) {
  if (!engineTypes || !engineTypes.length)
    return idEnginetype == 1? "NetIPS":"HostIPS";
  let engineTypeObj = engineTypes.find(type => type.idEnginetype === idEnginetype);
  return (engineTypeObj || {}).name;
}
export {engineTypeLabel};
