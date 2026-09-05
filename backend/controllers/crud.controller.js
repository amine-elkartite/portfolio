export const ok=(res,data,message='Opération réussie.',status=200)=>res.status(status).json({success:true,message,data});
export function crud(model, transform=async x=>x) {
  return {
    async list(req,res) { return ok(res,await model.all()); },
    async get(req,res) { const row=await model.find(req.params.id); if (!row) return res.status(404).json({success:false,message:'Élément introuvable.'}); return ok(res,row); },
    async create(req,res) { return ok(res,await model.create(await transform(req.validated,req)),'Élément créé.',201); },
    async update(req,res) { if (!await model.find(req.params.id)) return res.status(404).json({success:false,message:'Élément introuvable.'}); return ok(res,await model.update(req.params.id,await transform(req.validated,req)),'Modifications enregistrées.'); },
    async remove(req,res) { if (!await model.remove(req.params.id)) return res.status(404).json({success:false,message:'Élément introuvable.'}); return ok(res,null,'Élément supprimé.'); }
  };
}
