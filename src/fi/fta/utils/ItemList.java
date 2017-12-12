package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;


public class ItemList<T>
{
	
	public static final int DEFAULT_ITEMS_PER_PAGE = 20;
	
	protected ArrayList<T> items;
	protected int itemsPerPage;
	protected int page;
	private ItemListComparator<T> lastComparator;
	
	public ItemList(List<T> items)
	{
		this.items = new ArrayList<T>(items);
		itemsPerPage = ItemList.DEFAULT_ITEMS_PER_PAGE;
		page = 0;
	}
	
	public ArrayList<T> getItems()
	{
		return items;
	}
	
	public List<T> getItems(int fromIndex, int toIndex)
	{
		return items.subList(fromIndex, toIndex);
	}
	
	public List<T> getPageItems()
	{
		int fromIndex = page * itemsPerPage;
		int toIndex = fromIndex + itemsPerPage;
		
		return items.subList(fromIndex, Math.min(toIndex, items.size()));
	}
	
	public int getPageItemCount()
	{
		int fromIndex = page * itemsPerPage;
		int toIndex = fromIndex + itemsPerPage;
		
		return Math.min(toIndex, items.size()) - fromIndex;
	}
	
	public int getPage()
	{
		return page;
	}
	
	public void setPage(int page)
	{
		if (0 <= page && page < this.getPageCount())
			this.page = page;
		else if (page < 0 || this.getPageCount() == 0)
			this.page = 0;
		else
			this.page = this.getPageCount() - 1 ;
	}
	
	public void nextPage()
	{
		++page;
	}
	
	public void previousPage()
	{
		--page;
	}
	
	public int getItemsPerPage()
	{
		return itemsPerPage;
	}
	
	public void setItemsPerPage(int itemsPerPage)
	{
		page = (int)Math.floor((float)page / (float)this.itemsPerPage * (float)itemsPerPage);
		this.itemsPerPage = itemsPerPage;
	}
	
	public int getItemCount()
	{
		return items.size();
	}
	
	public int getPageCount()
	{
		return (int)Math.ceil((double)items.size() / itemsPerPage);
	}
	
	public void sort(ItemListComparator<T> comparator)
	{
		Collections.sort(items, comparator);
		lastComparator = comparator;
	}
	
	public void resort()
	{
		if (lastComparator != null)
			this.sort(lastComparator);
	}
	
	public boolean isEmpty()
	{
		return items.isEmpty();
	}
	
	public static abstract class ItemListComparator<T> implements Comparator<T>
	{
		
		public static <T> ItemListComparator<T> getItemListComparator(Comparator<T> c)
		{
			final Comparator<T> fc = c;
			
			return new ItemListComparator<T>()
			{
				public int compare(T o1, T o2)
				{
					return fc.compare(o1, o2);
				};
			};
		}
		
		public void init()
		{}
		
	}
	
	public static class InverseItemListComparator<T> extends ItemListComparator<T>
	{
		
		private ItemListComparator<T> comparator;
		
		public InverseItemListComparator(ItemListComparator<T> comparator)
		{
			this.comparator = comparator;
		}
		
		@Override
		public void init()
		{
			comparator.init();
		}
		
		public int compare(T arg0, T arg1)
		{
			return -comparator.compare(arg0, arg1);
		}
		
	}
	
}
