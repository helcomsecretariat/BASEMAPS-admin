package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.ui.CategoryCountsUI;
import fi.fta.data.managers.CategoryBeanManager;
import fi.fta.data.managers.CategoryManager;
import fi.fta.data.managers.SimpleUrlServiceManager;
import fi.fta.data.managers.WFSManager;
import fi.fta.data.managers.WMSManager;

public class SummaryWorkbook
{
	
	private static String [] columns = {
		"ID", "Name", "WMS", "WFS", "ArcGis", "Downloadables"};
	private static CategoryBeanManager<?, ?, ?>[] managers = {
		WMSManager.getInstance(),
		WFSManager.getInstance(),
		SimpleUrlServiceManager.getArcGISInstance(),
		SimpleUrlServiceManager.getDownloadableInstance()
	};
	private static List<Function<CategoryCountsUI, Integer>> counters = new ArrayList<>();
	static {
		counters.add((cui)->{return cui.getWmses();});
		counters.add((cui)->{return cui.getWfses();});
		counters.add((cui)->{return cui.getArcgises();});
		counters.add((cui)->{return cui.getDownloadables();});
	};
	
	
	private Workbook workbook;
	
	private Sheet sheet;
	
	private int index;
	
	
	public SummaryWorkbook()
	{
		this.workbook = new XSSFWorkbook();
		this.sheet = workbook.createSheet("Categories");
		this.index = 0;
		Row header = this.sheet.createRow(this.index++);
		for (int i = 0; i < SummaryWorkbook.columns.length; i++)
		{
			header.createCell(i).setCellValue(SummaryWorkbook.columns[i]);
		}
		Font font = this.workbook.createFont();
		font.setBold(true);
		CellStyle style = this.workbook.createCellStyle();
		style.setFont(font);
		header.setRowStyle(style);
	}
	
	public void set(Long id, Integer depth) throws HibernateException
	{
		if (id == null)
		{
			if (depth == null || depth.intValue() == 0)
			{
				this.set("", CategoryManager.getInstance().getRoot());
			}
			else if (depth.intValue() > 0)
			{
				this.setDown("", CategoryManager.getInstance().getRoot(), depth);
			}
			else
			{
				this.setUp("", CategoryManager.getInstance().getYoungest(), depth);
			}
		}
		else
		{
			Category c = CategoryManager.getInstance().get(id);
			if (depth == null || depth.intValue() == 0)
			{
				this.set("", Collections.singletonList(c));
			}
			else if (depth.intValue() > 0)
			{
				this.setDown("", Collections.singletonList(c), depth);
			}
			else
			{
				this.setUp("", BeansUtils.getYoungest(c), depth);
			}
		}
	}
	
	private void set(String prefix, List<Category> categories) throws HibernateException
	{
		for (Category c : categories)
		{
			String name = (Util.isEmptyString(prefix) ? "" : (prefix + " > ")) + c.getLabel();
			if (Util.isEmptyCollection(c.getChildren()))
			{
				this.createRow(name, c);
			}
			else
			{
				this.set(name, c.getChildren());
			}
		}
	}
	
	private void setDown(String prefix, List<Category> categories, int depth)
	{
		for (Category c : categories)
		{
			String name = (Util.isEmptyString(prefix) ? "" : (prefix + " > ")) + c.getLabel();
			if (Util.isEmptyCollection(c.getChildren()))
			{
				this.createRow(name, c);
			}
			else if (depth == 1)
			{
				CategoryCountsUI counts = new CategoryCountsUI();
				BeansUtils.getSummary(c.getChildren()).forEach(
					(csui)->{counts.sum(csui.getCounts());});
				this.createRow(name, c.getId(), counts);
			}
			else
			{
				
				this.setDown(name, c.getChildren(), depth-1);
			}
		}
	}
	
	private void setUp(String prefix, List<Category> categories, int depth)
	{
		this.set(prefix, BeansUtils.getParents(categories, depth));
	}
	
	private void createRow(String name, Category c) throws HibernateException
	{
		Row row = sheet.createRow(index++);
		row.createCell(0).setCellValue(c.getId());
		row.createCell(1).setCellValue(name);
		for (int i = 0; i < managers.length; i++)
		{
			row.createCell(i+2).setCellValue(
				managers[i].countChildren(c.getId()));
		}
	}
	
	private void createRow(String name, Long id, CategoryCountsUI ui)
	{
		Row row = sheet.createRow(index++);
		row.createCell(0).setCellValue(id);
		row.createCell(1).setCellValue(name);
		for (int i = 0; i < counters.size(); i++)
		{
			row.createCell(i+2).setCellValue(
				counters.get(i).apply(ui));
		}
	}
	
	public Workbook getWorkbook()
	{
		return workbook;
	}
	
}
