import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index(req: Request, res: Response) {
        const { city, uf, items  } = req.query;

        const parsedItems = String(items)
            .split(',')
            .map( item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        return res.json(points);
    }
    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = req.body;
    
        const trx = await knex.transaction();   // avoid insert problems in the queries
        
        const point = {
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        };
        const insertedIds = await trx('points').insert(point); // return the inserted database ids
        
        const point_id = insertedIds[0];
        // console.log('id do Point gerado: ' + point_id);
        
        const pointItems = items.map( (item_id: number) => {
            return {
                item_id,
                point_id
            }
        });
        await trx('point_items').insert(pointItems);

        await trx.commit();  // always use commit() when using transaction() 🔥

        return res.json({
            id: point_id,
            ...point,        //spread operator retorno informações de um objeto dentro de outro objeto
        });
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return res.status(400).json({ message: 'Point not found.'});
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title')

        return res.json({point, items});
    }
}

export default PointsController;