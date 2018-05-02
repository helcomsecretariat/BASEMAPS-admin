package fi.fta.data.managers;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.CategoryBean;
import fi.fta.beans.ui.CategoryBeanUI;
import fi.fta.data.dao.CategoryBeanDAO;
import fi.fta.model.SiteModel;

public abstract class CategoryBeanManager<C extends CategoryBean, UI extends CategoryBeanUI, D extends CategoryBeanDAO<C>>
{
	
	protected D dao;
	
	public CategoryBeanManager(D dao)
	{
		this.dao = dao;
	}
	
	public C get(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	public Long add(C c) throws HibernateException
	{
		return dao.add(c).getId();
	}
	
	public C update(C c) throws HibernateException
	{
		return dao.update(c);
	}
	
	public abstract Boolean position(Long id, Integer position, SiteModel m) throws HibernateException;
	
	public abstract Boolean delete(Long id, SiteModel m) throws HibernateException;
	
	public abstract Category getParent(Long parent) throws HibernateException;
	
	public abstract UI getUI(Long id, SiteModel m) throws HibernateException;
	
	public abstract List<C> getChildren(Long id) throws HibernateException;
	
	public abstract Long add(UI ui, SiteModel m) throws Exception;
	
	public abstract C update(UI ui, SiteModel m) throws Exception;
	
}
