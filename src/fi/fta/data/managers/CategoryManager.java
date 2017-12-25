package fi.fta.data.managers;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.data.dao.CategoryDAO;

public class CategoryManager
{
	
	protected CategoryDAO dao;
	
	protected static CategoryManager instance;
	
	public static CategoryManager getInstance()
	{
		if (instance == null)
		{
			synchronized (CategoryManager.class)
			{
				if (instance == null)
				{
					instance = new CategoryManager();
				}
			}
		}
		return instance;
	}
	
	protected CategoryManager()
	{
		dao = new CategoryDAO();
	}
	
	
	public Category get(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	public List<Category> getRoot() throws HibernateException
	{
		return dao.getRoot();
	}
	
	public boolean add(Category category) throws HibernateException
	{
		return dao.add(category).getId() != null;
	}
	
	public boolean add(CategoryUI ui) throws HibernateException
	{
		Category c = new Category(ui);
		if (ui.getParent() != null)
		{
			c.setParent(dao.get(ui.getParent()));
		}
		return this.add(c);
	}
	
	public Category update(Category category) throws HibernateException
	{
		return dao.update(category);
	}
	
	public boolean delete(Long id) throws HibernateException
	{
		return dao.delete(id) > 0;
	}
	
}
