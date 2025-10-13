import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VagasService, Vaga } from '../../services/vagas.service';

@Component({
  selector: 'app-vagas',
  imports: [CommonModule],
  templateUrl: './vagas.component.html',
  styleUrl: './vagas.component.scss'
})
export class VagasComponent implements OnInit {
  categorias = [
    'Programação', 'QA', 'Dados', 'Projetos', 'Produtos',
    'Segurança', 'RH', 'Marketing', 'Design', 'Vendas'
  ];

  categoriaSelecionada: string = 'Todas';
  vagas: Vaga[] = [];

  constructor(private vagasService: VagasService) {}

  ngOnInit(): void {
    this.vagasService.getAll().subscribe(vagas => {
      this.vagas = vagas;
    });
  }

  get vagasFiltradas(): Vaga[] {
    if (this.categoriaSelecionada === 'Todas') {
      return this.vagas;
    }
    return this.vagas.filter(vaga =>
      vaga.categorias.includes(this.categoriaSelecionada)
    );
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  abrirVaga(link: string): void {
    window.open(link, '_blank');
  }
}
