package fi.fta.data.dao;

import org.hibernate.HibernateException;

import fi.fta.beans.WFS;

public class WFSDAO extends LayerServiceDAO<WFS>
{
	
	public WFSDAO()
	{
		super(WFS.class);
	}
	
	@Override
	public WFS add(WFS ent) throws HibernateException
	{
		WFS ret = super.add(ent);
		if (ent.getInfo() != null)
		{
			ent.getInfo().setParent(ret.getId());
			//ret.setInfo(new WMSInfoDAO().add(ent.getInfo()));
		}
		return ret;
	}
	
	@Override
	public WFS update(WFS ent) throws HibernateException
	{
		WFS ret = super.update(ent);
		if (ent.getInfo() != null)
		{
			if (ent.getInfo().getParent() == null)
			{
				ent.getInfo().setParent(ent.getId());
				//ent.setInfo(new WMSInfoDAO().add(ent.getInfo()));
			}
			else
			{
				//ent.setInfo(new WMSInfoDAO().update(ent.getInfo()));
			}
		}
		return ret;
	}
	
}
